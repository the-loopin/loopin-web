import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const schemaUrl =
  process.env.OPENAPI_SCHEMA_URL ??
  "http://localhost:8080/api/v3/api-docs";

const outputPath = path.resolve(
  process.cwd(),
  "contracts",
  "openapi.json",
);

const requiredContractEntries = [
  {
    label: "EventCreateRequest.imageMediaId",
    path: [
      "components",
      "schemas",
      "EventCreateRequest",
      "properties",
      "imageMediaId",
    ],
  },
  {
    label: "EventUpdateRequest.imageMediaId",
    path: [
      "components",
      "schemas",
      "EventUpdateRequest",
      "properties",
      "imageMediaId",
    ],
  },
  {
    label: "EventResponse.image",
    path: [
      "components",
      "schemas",
      "EventResponse",
      "properties",
      "image",
    ],
  },
  {
    label: "CreateGroupRequest.imageMediaId",
    path: [
      "components",
      "schemas",
      "CreateGroupRequest",
      "properties",
      "imageMediaId",
    ],
  },
  {
    label: "GroupResponse.image",
    path: [
      "components",
      "schemas",
      "GroupResponse",
      "properties",
      "image",
    ],
  },
  {
    label: "UserProfileResponse.avatar",
    path: [
      "components",
      "schemas",
      "UserProfileResponse",
      "properties",
      "avatar",
    ],
  },
  {
    label: "UpdateUserAvatarRequest schema",
    path: [
      "components",
      "schemas",
      "UpdateUserAvatarRequest",
    ],
  },
  {
    label: "MediaReferenceResponse schema",
    path: [
      "components",
      "schemas",
      "MediaReferenceResponse",
    ],
  },
  {
    label: "PUT /v1/me/avatar",
    path: [
      "paths",
      "/v1/me/avatar",
      "put",
    ],
  },
  {
    label: "DELETE /v1/me/avatar",
    path: [
      "paths",
      "/v1/me/avatar",
      "delete",
    ],
  },
];

function getNestedValue(value, propertyPath) {
  return propertyPath.reduce((current, key) => {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return undefined;
    }

    return current[key];
  }, value);
}

function validateOpenApiDocument(document) {
  if (
    !document ||
    typeof document !== "object" ||
    (!document.openapi && !document.swagger)
  ) {
    throw new Error(
      "The fetched document is not a valid OpenAPI document.",
    );
  }

  const missingEntries = requiredContractEntries
    .filter(
      ({ path: propertyPath }) =>
        getNestedValue(document, propertyPath) === undefined,
    )
    .map(({ label }) => label);

  if (missingEntries.length > 0) {
    throw new Error(
      [
        "The fetched OpenAPI contract is stale or was generated from the wrong backend process.",
        "",
        "Missing required contract entries:",
        ...missingEntries.map((entry) => `- ${entry}`),
        "",
        "Stop old backend processes and containers, run a clean backend build,",
        "then fetch /api/v3/api-docs from that clean instance.",
      ].join("\n"),
    );
  }
}

async function fetchOpenApiDocument() {
  console.log(`Fetching OpenAPI schema from ${schemaUrl}`);

  const response = await fetch(schemaUrl, {
    headers: {
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(
      `OpenAPI request failed with HTTP ${response.status} ${response.statusText}.`,
    );
  }

  const responseText = await response.text();

  try {
    return JSON.parse(responseText);
  } catch (error) {
    throw new Error(
      `The OpenAPI endpoint returned invalid JSON: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`,
    );
  }
}

async function main() {
  const document = await fetchOpenApiDocument();

  validateOpenApiDocument(document);

  fs.mkdirSync(path.dirname(outputPath), {
    recursive: true,
  });

  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(document, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `Validated OpenAPI snapshot written to ${outputPath}`,
  );

  console.log(
    [
      "",
      "Verified:",
      ...requiredContractEntries.map(
        ({ label }) => `- ${label}`,
      ),
    ].join("\n"),
  );
}

main().catch((error) => {
  console.error("");
  console.error("Failed to update OpenAPI snapshot.");

  console.error(
    error instanceof Error
      ? error.message
      : String(error),
  );

  process.exitCode = 1;
});

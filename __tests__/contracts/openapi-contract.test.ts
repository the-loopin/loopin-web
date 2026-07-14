import fs from "node:fs";
import path from "node:path";

import {
  describe,
  expect,
  it,
} from "vitest";

type OpenApiSchema = {
  properties?: Record<string, unknown>;
};

type OpenApiOperationMap = Record<
  string,
  unknown
>;

type OpenApiDocument = {
  openapi?: string;
  swagger?: string;
  paths?: Record<
    string,
    OpenApiOperationMap
  >;
  components?: {
    schemas?: Record<
      string,
      OpenApiSchema
    >;
  };
};

const snapshotPath = path.resolve(
  process.cwd(),
  "contracts",
  "openapi.json",
);

const snapshot = JSON.parse(
  fs.readFileSync(snapshotPath, "utf8"),
) as OpenApiDocument;

function getSchema(
  schemaName: string,
): OpenApiSchema {
  const schema =
    snapshot.components?.schemas?.[
      schemaName
    ];

  if (!schema) {
    throw new Error(
      `Missing OpenAPI schema: ${schemaName}`,
    );
  }

  return schema;
}

function getSchemaProperties(
  schemaName: string,
): Record<string, unknown> {
  const properties =
    getSchema(schemaName).properties;

  if (!properties) {
    throw new Error(
      `OpenAPI schema has no properties: ${schemaName}`,
    );
  }

  return properties;
}

function getPathOperations(
  route: string,
): OpenApiOperationMap {
  const operations =
    snapshot.paths?.[route];

  if (!operations) {
    throw new Error(
      `Missing OpenAPI path: ${route}`,
    );
  }

  return operations;
}

describe(
  "committed OpenAPI contract",
  () => {
    it(
      "is a valid OpenAPI document",
      () => {
        expect(
          snapshot.openapi ??
            snapshot.swagger,
        ).toBeTruthy();
      },
    );

    it(
      "contains the Event media attachment contract",
      () => {
        const createProperties =
          getSchemaProperties(
            "EventCreateRequest",
          );

        const updateProperties =
          getSchemaProperties(
            "EventUpdateRequest",
          );

        const responseProperties =
          getSchemaProperties(
            "EventResponse",
          );

        expect(
          createProperties,
        ).toHaveProperty(
          "imageMediaId",
        );

        expect(
          updateProperties,
        ).toHaveProperty(
          "imageMediaId",
        );

        expect(
          responseProperties,
        ).toHaveProperty(
          "image",
        );

        expect(
          createProperties,
        ).not.toHaveProperty(
          "imageUrl",
        );

        expect(
          updateProperties,
        ).not.toHaveProperty(
          "imageUrl",
        );
      },
    );

    it(
      "contains the Group media attachment contract",
      () => {
        expect(
          getSchemaProperties(
            "CreateGroupRequest",
          ),
        ).toHaveProperty(
          "imageMediaId",
        );

        expect(
          getSchemaProperties(
            "GroupResponse",
          ),
        ).toHaveProperty(
          "image",
        );
      },
    );

    it(
      "contains the Profile avatar contract",
      () => {
        expect(
          getSchemaProperties(
            "UserProfileResponse",
          ),
        ).toHaveProperty(
          "avatar",
        );

        expect(
          snapshot.components
            ?.schemas,
        ).toHaveProperty(
          "UpdateUserAvatarRequest",
        );

        const avatarOperations =
          getPathOperations(
            "/v1/me/avatar",
          );

        expect(
          avatarOperations,
        ).toHaveProperty("put");

        expect(
          avatarOperations,
        ).toHaveProperty("delete");
      },
    );

    it(
      "contains MediaReferenceResponse",
      () => {
        const mediaProperties =
          getSchemaProperties(
            "MediaReferenceResponse",
          );

        expect(
          mediaProperties,
        ).toHaveProperty("id");

        expect(
          mediaProperties,
        ).toHaveProperty(
          "contentType",
        );

        expect(
          mediaProperties,
        ).toHaveProperty(
          "sizeBytes",
        );
      },
    );
  },
);

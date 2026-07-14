/**
 * The generated EventCreateRequest/EventUpdateRequest schemas only accept an
 * imageUrl.  They do not expose imageMediaId or any media-attachment endpoint.
 * Refuse local-file uploads before a media asset is created, rather than leave
 * an unattached upload behind.
 */
export function assertEventImageContract(file: File | null): void {
  if (file) {
    throw new Error(
      "Image file uploads are unavailable until the API supports attaching media to an event. Use an image URL instead.",
    );
  }
}

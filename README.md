# Giffy

A self-hosted anime gif repository with a Cloudflare Worker API.

## API

Base URL: `https://giffy.piny.dev`

---

### `GET /:genre/:category/random`

Returns a random image entry from the given genre and category.

**URL Parameters**

| Parameter | Description |
|---|---|
| `genre` | The top-level genre folder (e.g. `anime`) |
| `category` | The image category (e.g. `slap`, `hug`) — filtered from the genre's `entries.json` |

**Query Parameters**

| Parameter | Type | Description |
|---|---|---|
| `tags` | `string` | Comma-separated tag filter. Use `&` within a group to AND tags, groups are OR'd.<br>Example: `f4f&happy,f4a&happy,f4m` = `(f4f AND happy) OR (f4a AND happy) OR f4m` |
| `negative_tags` | `string` | Same syntax as `tags` but excludes matching entries |
| `type` | `string` | Filter by type: `anim` or `still` |
| `formats` | `string` | Comma-separated acceptable formats (e.g. `gif,webp`). First match wins for the returned URL |
| `redirect` | `boolean` | If `true`, returns a `302` redirect directly to the image instead of JSON |

**Response**

```json
{
  "category": "slap",
  "tags": ["f4a", "indoor", "vintage"],
  "type": "anim",
  "file": "ml19zR8F",
  "formats": ["gif"],
  "hash": "PyA8iSEsiaEU4LYdN4OpjyAUApGxeMA87SE2UeeqdXY=",
  "url": "https://giffy-r.piny.dev/anime/assets/ml19zR8F.gif"
}
```

**Error Responses**

| Status | Meaning |
|---|---|
| `404` | Genre/category doesn't exist, or no entries matched the filters |
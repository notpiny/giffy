# Giffy
Gifs in a Jiffy.

## API

Base URL: `https://giffy.piny.dev`

All image assets and entry data are served via [jsDelivr](https://www.jsdelivr.com/) from the `NotPiny/Giffy` GitHub repo.

---

### `GET /:genre/:category/random`

Returns a random image entry from the given genre and category.

**URL Parameters**

| Parameter | Description |
|---|---|
| `genre` | The top-level genre folder (e.g. `anime`, `irl`) |
| `category` | The category within that genre (e.g. `slap`, `hug`) |

**Query Parameters**

| Parameter | Type | Description |
|---|---|---|
| `tags` | `string` | Comma-separated tag filter. Use `&` within a group to require multiple tags. Groups are OR'd, tags within a group are AND'd.<br>Example: `f4f&happy,f4a&happy,f4m` = `(f4f AND happy) OR (f4a AND happy) OR f4m` |
| `negative_tags` | `string` | Same syntax as `tags`, but excludes matching entries instead |
| `type` | `string` | Filter by entry type. Either `anim` or `still` |
| `formats` | `string` | Comma-separated list of acceptable formats (e.g. `gif,webp,mp4`). The first format in this list that the entry supports is used for the URL |
| `redirect` | `boolean` | If `true`, returns a `302` redirect directly to the image instead of a JSON response |

**Response**

```json
{
  "category": "slap",
  "tags": ["f4a", "indoor", "vintage"],
  "type": "anim",
  "file": "ml19zR8F",
  "formats": ["gif"],
  "hash": "PyA8iSEsiaEU4LYdN4OpjyAUApGxeMA87SE2UeeqdXY=",
  "url": "https://cdn.jsdelivr.net/gh/NotPiny/Giffy/anime/slap/assets/ml19zR8F.gif"
}
```

**Error Responses**

| Status | Meaning |
|---|---|
| `404` | Genre/category doesn't exist, or no entries matched the given filters |

# Teritori rarity bot

## How to use

### Add a collection

```bash
$ yarn start collections add --contract $CONTRACT_ADDR --name "my-awesome-nfts"
[...]
```

in [pkg/collections/index.ts](./pkg/collections/index.ts) add your collection in `CollectionList`


```typescript
    new Collection("my-awesome-nfts"),
```

#### Use custom algorithm

You can extends the `Collection` class to add a custom algorithm, parsing methods, CmdSlashName ...

feel free to take a look at [Toripunks](./pkg/collections/Toripunks.ts) for that

### Start the bot

```bash
$ yarn start bot start --discord_token "xxxx.xxxxx.xxxx" --discord_client_id "424242424242"
```

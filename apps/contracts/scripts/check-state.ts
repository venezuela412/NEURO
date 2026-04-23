import { TonClient, Address, TupleBuilder } from "@ton/ton";

async function main() {
  const client = new TonClient({
    endpoint: "https://ton.access.orbs.network/55023c0ff5Bd3F8B62C092Ab4D238bEE463E5502/1/mainnet/toncenter-api-v2/jsonRPC",
  });

  const contractAddress = Address.parse("EQCjAVxDnmPPJfld77JuZuGdjN6OvWIrkwiDa8dwxyZ5ZyWQ");
  
  try {
    const isPaused = await client.runMethod(contractAddress, "isPaused");
    console.log("isPaused:", isPaused.stack.readBoolean());

    const tvl = await client.runMethod(contractAddress, "tvl");
    console.log("tvl:", tvl.stack.readBigNumber());

    const sharePrice = await client.runMethod(contractAddress, "sharePrice");
    console.log("sharePrice:", sharePrice.stack.readBigNumber());
  } catch (e) {
    console.error("Error running method:", e);
  }
}

main();

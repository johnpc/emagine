import { defineBackend, defineFunction } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { Function, FunctionUrlAuthType } from "aws-cdk-lib/aws-lambda";
import dotenv from "dotenv";
dotenv.config();

const omdbFunction = defineFunction({
  entry: "./function/omdbFunction.ts",
  timeoutSeconds: 30,
});

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  omdbFunction,
});

const outputs = {} as { [key: string]: string };
[{ name: "omdbFunction" }].forEach((functionInfo) => {
  const underlyingLambda =
    // eslint-disable-next-line
    (backend as any)[functionInfo.name].resources.lambda as Function;
  underlyingLambda.addEnvironment("OMDB_API_KEY", process.env.OMDB_API_KEY!);

  const functionUrl = underlyingLambda.addFunctionUrl({
    authType: FunctionUrlAuthType.NONE,
    cors: {
      allowedOrigins: ["*"],
      allowedHeaders: ["*"],
    },
  });
  outputs[functionInfo.name] = functionUrl.url;
});
backend.addOutput({
  custom: outputs,
});

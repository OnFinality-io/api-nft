CREATE SCHEMA IF NOT EXISTS "my_schema";

CREATE TABLE IF NOT EXISTS "my_schema".data (
id text not null primary key,
metadata jsonb,
metadata_uri text,
metadata_status text,
metadata_data text
);

CREATE SCHEMA IF NOT EXISTS "moobeam";
CREATE TYPE "moobeam"."842d2921b5" as ENUM ('PENDING','PROCESSING','COMPLETED','FAILED','UNKNOWN','INVALID');
CREATE TABLE IF NOT EXISTS "moobeam"."metadata" (
"id" text NOT NULL ,
"metadata_status" "moobeam"."842d2921b5" NOT NULL,
"name" text,
"symbol" text,
"token_uri" text,
"image_uri" text,
"description" text,
"raw" JSONB,
PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "erc721_eth"."metadata" (
"id" text NOT NULL ,
"metadata_uri" text NOT NULL,
"raw" JSONB,
"metadata_status" "erc721_eth"."842d2921b5" NOT NULL,
"name" text,
"symbol" text,
"token_uri" text,
"image_uri" text,
"description" text,
PRIMARY KEY ("id"));



INSERT INTO "moobeam"."metadata" ("id", "metadata_status") values('ipfs://QmQGsXVt5o8Qf2J3to21RJYdHsNZQaVFosPYNSMS5CHW7U/2.json', 'PENDING');
INSERT INTO "moobeam"."metadata" ("id", "metadata_status") values('https://arweave.net/KTpuWvFpa8Fgj7t1dUVwZ2yhpfHWMcN8vkziGrwxbcg', 'PENDING');
INSERT INTO "moobeam"."metadata" ("id", "metadata_status") values('data:application/json;base64,eyJhYmMiOiIxMjMifQo=', 'PENDING');
INSERT INTO "moobeam"."metadata" ("id", "metadata_status") values('http://arweave.net/0UEGZt7ElVMHria4M6R6ktje0N_ycZ6ZanKlpYczG4Q', 'PENDING');
INSERT INTO "moobeam"."metadata" ("id", "metadata_status") values('https://www.as-faucet.xyz/api/metadata?type=shiden&id=61', 'PENDING');
--INSERT INTO "my_schema".data ("id", "metadata_uri", "metadata_status") values('3', 'data:application/json;base64,eyJhYmMiOiIxMjMifQ==', 'PENDING');

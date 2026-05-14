// --allow-read --allow-write
import { parseArgs } from "@std/cli/parse-args";

const args = parseArgs(Deno.args);

const outputFormat = args.f as string;
const inputFile = args.i as string;
const outputFile = args.o as string;

if (!outputFormat || !inputFile || !outputFile) {
    console.error(`Usage: -f <output format> -i <input file> -o <output file>`);
    Deno.exit(1);
}

const inputData = await Deno.readTextFile(inputFile);

if (outputFormat === "candy") {
    const convertedData = convertToCandy(inputData);
    await Deno.writeTextFile(outputFile, convertedData);
} else if (outputFormat === 'giffy') {
    const convertedData = convertToGiffy(inputData);
    await Deno.writeTextFile(outputFile, convertedData);
}

type CandyItem = {
    category: string
    tags: Array<string>
    type: string
    url: string
    taggedBy: string
    hash: string
}

type GiffyItem = {
    category: string
    tags: Array<string>
    type: string
    file: string
    formats: Array<string>
    hash: string
};

function convertToCandy(input: string): string {
    // Candy is just JSONL and like one difference

    const data = JSON.parse(input);

    return data.map((item: GiffyItem) => {
        return JSON.stringify({
            category: item.category,
            tags: item.tags,
            type: item.type,
            url: `https://giffy-r.piny.dev/anime/assets/${item.file}.${item.formats[0]}`,
            taggedBy: null,
            hash: item.hash
        });
    }).join("\n");
}

function convertToGiffy(input: string): string {
    const lines = input.split("\n");
    const data = lines.map(line => JSON.parse(line) as CandyItem);

    return JSON.stringify(data.map(item => {
        const urlParts = item.url.split("/");
        const fileWithExt = urlParts[urlParts.length - 1];
        const [file, ext] = fileWithExt.split(".");
        return {
            category: item.category,
            tags: item.tags,
            type: item.type,
            file,
            formats: [ext],
            hash: item.hash
        } as GiffyItem;
    }), null, 4);
}
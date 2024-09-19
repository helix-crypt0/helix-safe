import { HelixSafeApiResponse } from "@src/interfaces/interfaces";
import { NextApiResponse } from "next";

export function sendApiResponse(
    res: NextApiResponse,
    tar: HelixSafeApiResponse
) {
    res.send(tar);
}

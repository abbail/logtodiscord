import { AuctionType } from "./auction-type";

export interface AuctionPieces {
    auctioneer: string;
    body: string;
    type: AuctionType;
}
// All onboarding content lives here. Edit the text, and add your images:
// 1) put the file in src/assets/images/  2) un-comment its import  3) replace `image: null`
// Until then the slide shows a grey box, so the page never crashes.

import browseImg from "../assets/images/browse-img.png";
import createImg from "../assets/images/create-img.png";
import curateImg from "../assets/images/curate-img.png";
import readyImg from "../assets/images/blume.png";

export const slides = [
    {
        id: "browse",
        title: "browse",
        body: "Explore a garden of fresh blooms, from lilies to roses, and find the flowers that speak to you",
        image: browseImg,
        alt: "The flower catalog and search screens",
    },
    {
        id: "create",
        title: "create",
        body: "Mix and match blooms, colors, and greenery to design a bouquet that’s uniquely yours", // placeholder copy
        image: createImg,
        alt: "The manual and AI customization",
    },
    {
        id: "three",
        title: "curate",
        body: "Your blooms, your style. Manage your account, revisit your bouquets, and keep the designs you love close",
        image: curateImg,
        alt: "The generated designs and liked designs",
    },
    {
        id: "four",
        title: "ready",
        body: "Everything’s in bloom. Jump in and start building your first bouquet.",
        image: readyImg,
        alt: "",
    },
];

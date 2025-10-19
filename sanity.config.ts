"use client";

import { defineConfig } from "sanity";
import { visionTool } from "@sanity/vision";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemaTypes";
import { dataset, projectId } from "./sanity/env";

const title = process.env.SANITY_STUDIO_TITLE || "foxsportscards1of1 studio";

export default defineConfig({
  name: "foxsportscards1of1-studio",
  title,
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool(),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});

import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

type UploadedFile = {
  fileName: string;
  originalName: string;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((item): item is File => item instanceof File);
    if (files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadRoot = process.env.VERCEL
      ? path.join(os.tmpdir(), "uploads", "evidence")
      : path.join(process.cwd(), "public", "uploads", "evidence");
    await mkdir(uploadRoot, { recursive: true });

    const uploaded: UploadedFile[] = [];
    for (const file of files) {
      const ext = path.extname(file.name);
      const fileName = `${crypto.randomUUID()}${ext}`;
      const filePath = path.join(uploadRoot, fileName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      uploaded.push({ fileName, originalName: file.name });
    }

    return NextResponse.json({ files: uploaded }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

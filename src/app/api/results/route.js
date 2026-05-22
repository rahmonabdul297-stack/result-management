import { NextResponse } from "next/server";
import { getStudentResults, saveStudentResult } from "@/lib/resultsService";

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body?.name?.trim?.() || !body?.admissionNo?.trim?.()) {
      return NextResponse.json(
        { error: "Student name and admission number are required." },
        { status: 400 }
      );
    }

    const saved = await saveStudentResult(body);
    return NextResponse.json({ success: true, result: saved }, { status: 201 });
  } catch (error) {
    console.error("POST /api/results error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save result." },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      classSlug: searchParams.get("classSlug") || undefined,
      className: searchParams.get("className") || undefined,
      term: searchParams.get("term") || undefined,
      academicSession: searchParams.get("academicSession") || undefined,
    };

    const results = await getStudentResults(filters);
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("GET /api/results error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch results." },
      { status: 500 }
    );
  }
}

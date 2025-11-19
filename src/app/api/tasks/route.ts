import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Import the connection we just made

export async function GET() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return the real data
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();

  // Insert a new task into Supabase
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ title: body.title }])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: Get all tasks
export async function GET() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST: Create a new task (Default status: 'todo')
export async function POST(request: Request) {
  const body = await request.json();

  const { data, error } = await supabase
    .from('tasks')
    .insert([{ 
      title: body.title, 
      status: 'todo', 
      priority: 'medium' 
    }])
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PATCH: Move task to a different column
export async function PATCH(request: Request) {
  const body = await request.json();

  const { data, error } = await supabase
    .from('tasks')
    .update({ status: body.status }) 
    .eq('id', body.id)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE: Delete a task
export async function DELETE(request: Request) {
  const body = await request.json();

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Deleted successfully" });
}
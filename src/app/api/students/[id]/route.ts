import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Student } from '../route';

interface DatabaseError {
  code?: string;
  message?: string;
}

// GET /api/students/[id] - ดึงข้อมูลตาม sid
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sid = parseInt(id, 10);

    if (isNaN(sid)) {
      return NextResponse.json(
        { success: false, error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    const result = await query<Student>(
      'SELECT sid, sname, phon FROM public.student WHERE sid = $1;',
      [sid]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลนักศึกษา' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: unknown) {
    const dbErr = error as DatabaseError;
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { success: false, error: dbErr?.message || 'Failed to fetch student' },
      { status: 500 }
    );
  }
}

// PUT /api/students/[id] - แก้ไขข้อมูลตาม sid
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentSid = parseInt(id, 10);

    if (isNaN(currentSid)) {
      return NextResponse.json(
        { success: false, error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { sname, phon } = body;

    if (!sname?.trim()) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกชื่อนักศึกษา (sname)' },
        { status: 400 }
      );
    }

    const parsedPhon = parseInt(phon, 10);
    if (isNaN(parsedPhon)) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุเบอร์โทรศัพท์ (phon) เป็นตัวเลข' },
        { status: 400 }
      );
    }

    const sql = `
      UPDATE public.student
      SET sname = $1, phon = $2
      WHERE sid = $3
      RETURNING sid, sname, phon;
    `;
    const values = [sname.trim(), parsedPhon, currentSid];

    const result = await query<Student>(sql, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลนักศึกษาที่ต้องการแก้ไข' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'อัปเดตข้อมูลนักศึกษาสำเร็จ',
    });
  } catch (error: unknown) {
    const dbErr = error as DatabaseError;
    console.error('Error updating student:', error);
    return NextResponse.json(
      { success: false, error: dbErr?.message || 'Failed to update student' },
      { status: 500 }
    );
  }
}

// DELETE /api/students/[id] - ลบข้อมูลตาม sid
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sid = parseInt(id, 10);

    if (isNaN(sid)) {
      return NextResponse.json(
        { success: false, error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    const result = await query<Student>(
      'DELETE FROM public.student WHERE sid = $1 RETURNING sid;',
      [sid]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลนักศึกษาที่ต้องการลบ' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ลบข้อมูลนักศึกษาเรียบร้อยแล้ว',
    });
  } catch (error: unknown) {
    const dbErr = error as DatabaseError;
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { success: false, error: dbErr?.message || 'Failed to delete student' },
      { status: 500 }
    );
  }
}

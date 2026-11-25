import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export interface Student {
  sid: number;
  sname: string;
  phon: number;
}

interface DatabaseError {
  code?: string;
  message?: string;
}

// GET /api/students - ดึงรายการนักศึกษา
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();

    let sql = `SELECT sid, sname, phon FROM public.student`;
    const values: unknown[] = [];

    if (search) {
      sql += ` WHERE sname ILIKE $1 OR CAST(sid AS TEXT) LIKE $1 OR CAST(phon AS TEXT) LIKE $1`;
      values.push(`%${search}%`);
    }

    sql += ` ORDER BY sid ASC;`;

    const result = await query<Student>(sql, values);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: unknown) {
    const dbErr = error as DatabaseError;
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { success: false, error: dbErr?.message || 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST /api/students - เพิ่มนักศึกษาใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sid, sname, phon } = body;

    const parsedSid = parseInt(sid, 10);
    const parsedPhon = parseInt(phon, 10);

    if (isNaN(parsedSid)) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุรหัสนักศึกษา (sid) เป็นตัวเลข' },
        { status: 400 }
      );
    }

    if (!sname?.trim()) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกชื่อนักศึกษา (sname)' },
        { status: 400 }
      );
    }

    if (isNaN(parsedPhon)) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุเบอร์โทรศัพท์ (phon) เป็นตัวเลข' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO public.student (sid, sname, phon)
      VALUES ($1, $2, $3)
      RETURNING sid, sname, phon;
    `;
    const values = [parsedSid, sname.trim(), parsedPhon];

    const result = await query<Student>(sql, values);
    return NextResponse.json(
      { success: true, data: result.rows[0], message: 'เพิ่มข้อมูลนักศึกษาสำเร็จ' },
      { status: 201 }
    );
  } catch (error: unknown) {
    const dbErr = error as DatabaseError;
    console.error('Error creating student:', error);
    if (dbErr?.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'รหัสนักศึกษา (sid) นี้มีอยู่ในระบบแล้ว' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: dbErr?.message || 'Failed to create student' },
      { status: 500 }
    );
  }
}

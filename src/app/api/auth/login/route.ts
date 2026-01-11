import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (email === process.env.ADMIN_EMAIL && await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH || '')) {
      return NextResponse.json({ success: true, token: 'admin-token' }); // Simple token
    }
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
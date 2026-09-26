import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request){const session=await getSession();if(!session)return NextResponse.json({message:'Unauthorized'},{status:401});if(session.role!=='user')return NextResponse.json({message:'Forbidden'},{status:403});try{const schoolId=Number(request.cookies.get('schoolhub_school_id')?.value||1); const [rows]=await db.query(`SELECT s.*,a.judul AS tugas,a.deadline,c.nama_kelas FROM submissions s JOIN assignments a ON a.id_assignment=s.assignment_id JOIN classes c ON c.id_class=a.class_id WHERE s.student_id=? AND c.school_id=? ORDER BY s.submitted_at DESC`,[session.id_user,schoolId]);return NextResponse.json({data:rows});}catch(e){return NextResponse.json({message:'Gagal mengambil pengumpulan',error:e.message},{status:500});}}

export async function POST(request){
 const session=await getSession();if(!session)return NextResponse.json({message:'Unauthorized'},{status:401});if(session.role!=='user')return NextResponse.json({message:'Forbidden'},{status:403});
 try{
  const schoolId=Number(request.cookies.get('schoolhub_school_id')?.value||1); const form=await request.formData(),assignmentId=Number(form.get('assignment_id')),catatan=String(form.get('catatan')||'').trim(),file=form.get('file');
  if(!assignmentId)return NextResponse.json({message:'Tugas wajib dipilih'},{status:400});if(!file||typeof file.arrayBuffer!=='function'||file.size<=0)return NextResponse.json({message:'File tugas wajib diunggah'},{status:400});if(file.size>15*1024*1024)return NextResponse.json({message:'Ukuran file maksimal 15 MB'},{status:400});
  const [a]=await db.query(`SELECT a.id_assignment,a.deadline FROM assignments a JOIN classes c ON c.id_class=a.class_id JOIN student_classes sc ON sc.class_id=a.class_id AND sc.student_id=? WHERE a.id_assignment=? AND c.school_id=?`,[session.id_user,assignmentId,schoolId]);if(!a.length)return NextResponse.json({message:'Tugas tidak ditemukan atau bukan untuk kelas kamu'},{status:404});
  const [old]=await db.query('SELECT id_submission,status,file_url FROM submissions WHERE assignment_id=? AND student_id=?',[assignmentId,session.id_user]);if(old.length&&old[0].status==='graded')return NextResponse.json({message:'Tugas ini sudah dinilai dan tidak dapat dikumpulkan ulang.'},{status:400});
  const safe=String(file.name||'tugas').replace(/[^a-zA-Z0-9._-]/g,'_'),unique=`${Date.now()}-${session.id_user}-${safe}`,dir=path.join(process.cwd(),'public','uploads','submissions');await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,unique),Buffer.from(await file.arrayBuffer()));const url=`/uploads/submissions/${unique}`,status=new Date()>new Date(a[0].deadline)?'late':'submitted';
  if(old.length){if(old[0].file_url?.startsWith('/uploads/'))try{await fs.unlink(path.join(process.cwd(),'public',old[0].file_url));}catch{}await db.query('UPDATE submissions SET file_name=?,file_url=?,catatan=?,submitted_at=NOW(),status=? WHERE id_submission=?',[file.name,url,catatan,status,old[0].id_submission]);}
  else await db.query('INSERT INTO submissions (assignment_id,student_id,file_name,file_url,catatan,submitted_at,status) VALUES (?,?,?,?,?,NOW(),?)',[assignmentId,session.id_user,file.name,url,catatan,status]);
  return NextResponse.json({message:status==='late'?'Tugas dikumpulkan terlambat':'Tugas berhasil dikumpulkan'});
 }catch(e){return NextResponse.json({message:'Gagal mengumpulkan tugas',error:e.message},{status:500});}
}

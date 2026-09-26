import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSchoolId, getSchoolSlug } from "@/lib/school";
import { StatCard, Section } from "@/components/ui";
import {
  ClipboardList,
  Users,
  BookOpen,
  Megaphone,
  CalendarDays,
  BarChart3,
} from "@/components/Icons";
import AnnouncementManager from "@/components/admin/AnnouncementManager";

function Banner({ role, name, schoolId }) {
  const schoolImage =
    Number(schoolId) === 2
      ? "/images/schools/sma-negeri-37-jakarta.png"
      : "/images/schools/smp-negeri-3-jakarta.png";

  return (
    <div className="banner-school">
      <img
        src={schoolImage}
        alt={
          Number(schoolId) === 2
            ? "SMA Negeri 37 Jakarta"
            : "SMP Negeri 3 Jakarta"
        }
        className="banner-school-image"
      />

      <div className="banner-school-overlay" />

      <div className="relative z-10">
        <p className="text-lg">Selamat datang,</p>

        <h1 className="text-4xl font-extrabold">{name}!</h1>

        <p>
          Terima kasih telah mengajar dan menginspirasi generasi masa depan.
        </p>
      </div>
    </div>
  );
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const schoolId = await getSchoolId();
  const schoolSlug = await getSchoolSlug();
  const schoolPrefix = `/school/${schoolSlug}`;
  const session = await getSession();
  const role = session?.role === "admin" ? "admin" : "user";
  const name =
    session?.nama_lengkap || (role === "admin" ? "Budi Santoso" : "Rafi Ahmad");
  if (role === "admin") {
    const teacherId = Number(session.id_user);
    const [[pending]] = await db.query(
      `SELECT COUNT(*) total FROM submissions s JOIN assignments a ON a.id_assignment=s.assignment_id JOIN classes c ON c.id_class=a.class_id WHERE a.teacher_id=? AND c.school_id=? AND s.status<>'graded'`,
      [teacherId, schoolId],
    );
    const [[classes]] = await db.query(
      `SELECT COUNT(*) total FROM teacher_classes tc JOIN classes c ON c.id_class=tc.class_id WHERE tc.teacher_id=? AND c.school_id=?`,
      [teacherId, schoolId],
    );
    const [[materials]] = await db.query(
      `SELECT COUNT(*) total
   FROM materials m
   JOIN classes c ON c.id_class=m.class_id
   WHERE m.teacher_id=?
   AND c.school_id=?
   AND m.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [teacherId, schoolId],
    );
    const [[announcements]] = await db.query(
      `SELECT COUNT(*) total FROM announcements WHERE teacher_id=? AND school_id=? AND created_at>=DATE_SUB(NOW(),INTERVAL 30 DAY)`,
      [teacherId, schoolId],
    );
    const day = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(
      new Date(),
    );
    const [schedules] = await db.query(
      `SELECT s.*,c.nama_kelas FROM schedules s JOIN classes c ON c.id_class=s.class_id WHERE s.teacher_id=? AND c.school_id=? AND s.hari=? ORDER BY s.jam_mulai`,
      [teacherId, schoolId, day],
    );
    const [assignments] = await db.query(
      `SELECT a.*,c.nama_kelas,(SELECT COUNT(*) FROM submissions s WHERE s.assignment_id=a.id_assignment AND s.status<>'graded') AS perlu_diperiksa FROM assignments a JOIN classes c ON c.id_class=a.class_id WHERE a.teacher_id=? AND c.school_id=? ORDER BY a.created_at DESC LIMIT 5`,
      [teacherId, schoolId],
    );
    const [materialsRows] = await db.query(
      `SELECT m.*,c.nama_kelas FROM materials m JOIN classes c ON c.id_class=m.class_id WHERE m.teacher_id=? AND c.school_id=? ORDER BY m.created_at DESC LIMIT 5`,
      [teacherId, schoolId],
    );
    const [announcementRows] = await db.query(
      `SELECT * FROM announcements WHERE teacher_id=? AND school_id=? ORDER BY created_at DESC LIMIT 5`,
      [teacherId, schoolId],
    );
    return (
      <div className="space-y-4">
        <Banner role={role} name={name} schoolId={schoolId} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            href={`${schoolPrefix}/grades`}
            icon={<ClipboardList />}
            value={pending.total || 0}
            label={
              <>
                Tugas Perlu
                <br />
                Diperiksa
              </>
            }
            tone="red"
          />
          <StatCard
            href={`${schoolPrefix}/classes`}
            icon={<Users />}
            value={classes.total || 0}
            label="Kelas yang Diampu"
            tone="blue"
          />
          <StatCard
            href={`${schoolPrefix}/materials`}
            icon={<BookOpen />}
            value={materials.total || 0}
            label="Materi Terbaru"
            tone="green"
          />
          <StatCard
            href="#pengumuman"
            icon={<Megaphone />}
            value={announcements.total || 0}
            label="Pengumuman Baru"
            tone="purple"
          />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <Section
            title="Jadwal Mengajar Hari Ini"
            action={`${day}, ${formatDate(new Date())}`}
          >
            <div className="space-y-2">
              {schedules.map((s, i) => (
                <div
                  key={s.id_schedule}
                  className="grid grid-cols-1 items-center gap-2 rounded-xl border border-[#E3EDF8] p-3 sm:grid-cols-[120px_1fr_auto] sm:gap-3"
                >
                  <span
                    className={`rounded-xl px-3 py-3 text-center text-sm font-bold ${i ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue"}`}
                  >
                    {String(s.jam_mulai).slice(0, 5)} –{" "}
                    {String(s.jam_selesai).slice(0, 5)}
                  </span>
                  <div>
                    <b className="text-[#102A72]">{s.mata_pelajaran}</b>
                    <div className="text-sm text-[#6176A8]">
                      Kelas {s.nama_kelas}
                    </div>
                  </div>
                  <div className="text-sm text-[#6176A8]">{s.ruang || "-"}</div>
                </div>
              ))}
              {!schedules.length && (
                <div className="py-8 text-center text-sm text-[#7185AF]">
                  Tidak ada jadwal mengajar hari ini.
                </div>
              )}
            </div>
          </Section>
          <Section
            title="Tugas Terbaru"
            action="Lihat Semua"
            actionHref={`${schoolPrefix}/assignments`}
          >
            <div className="space-y-2">
              {assignments.map((a) => (
                <Link
                  href={`${schoolPrefix}/grades`}
                  key={a.id_assignment}
                  className="grid grid-cols-1 items-center gap-2 rounded-xl border border-[#E3EDF8] p-3 transition hover:bg-[#F8FBFF] sm:grid-cols-[58px_1fr_auto] sm:gap-3"
                >
                  <span className="rounded-xl bg-blue-50 px-3 py-3 text-center font-bold text-blue">
                    {a.nama_kelas}
                  </span>
                  <div>
                    <b className="text-sm text-[#102A72]">{a.judul}</b>
                    <div className="text-xs text-[#6176A8]">
                      {a.perlu_diperiksa || 0} perlu diperiksa
                    </div>
                  </div>
                  <div className="text-left text-xs sm:text-right">
                    <div className="text-[#6176A8]">Deadline</div>
                    <b className="text-red-500">{formatDate(a.deadline)}</b>
                  </div>
                </Link>
              ))}
              {!assignments.length && (
                <div className="py-8 text-center text-sm text-[#7185AF]">
                  Belum ada tugas.
                </div>
              )}
            </div>
          </Section>
        </div>
        <div id="pengumuman" className="grid gap-4 xl:grid-cols-2">
          <AnnouncementManager initial={announcementRows} />
          <Section
            title="Materi Terbaru"
            action="Lihat Semua"
            actionHref={`${schoolPrefix}/materials`}
          >
            <div className="space-y-1">
              {materialsRows.map((m) => (
                <Link
                  href={`${schoolPrefix}/materials`}
                  key={m.id_material}
                  className="flex items-center gap-3 border-b border-[#EEF3F8] py-3 last:border-0"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-xs font-extrabold text-blue-600">
                    {m.file_type || "FILE"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <b className="block truncate text-sm text-[#102A72]">
                      {m.judul}
                    </b>
                    <div className="text-xs text-[#6176A8]">
                      {m.nama_kelas} • {m.file_name || "Tanpa file"}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-[#6176A8]">
                    {formatDate(m.created_at)}
                  </span>
                </Link>
              ))}
              {!materialsRows.length && (
                <div className="py-8 text-center text-sm text-[#7185AF]">
                  Belum ada materi.
                </div>
              )}
            </div>
          </Section>
        </div>
      </div>
    );
  }

  const studentId = Number(session.id_user);
  const [[pending]] = await db.query(
    `SELECT COUNT(*) total FROM assignments a JOIN classes c ON c.id_class=a.class_id JOIN student_classes sc ON sc.class_id=a.class_id AND sc.student_id=? LEFT JOIN submissions s ON s.assignment_id=a.id_assignment AND s.student_id=? WHERE c.school_id=? AND s.id_submission IS NULL`,
    [studentId, studentId, schoolId],
  );
  const [[deadlines]] = await db.query(
    `SELECT COUNT(*) total FROM assignments a JOIN classes c ON c.id_class=a.class_id JOIN student_classes sc ON sc.class_id=a.class_id AND sc.student_id=? WHERE c.school_id=? AND a.deadline BETWEEN NOW() AND DATE_ADD(NOW(),INTERVAL 7 DAY)`,
    [studentId, schoolId],
  );
  const [[ann]] = await db.query(
    `SELECT COUNT(*) total FROM announcements WHERE school_id=? AND created_at>=DATE_SUB(NOW(),INTERVAL 30 DAY)`,
    [schoolId],
  );
  const [[avg]] = await db.query(
    `SELECT ROUND(AVG(g.nilai),0) average FROM grades g JOIN submissions s ON s.id_submission=g.submission_id JOIN assignments a ON a.id_assignment=s.assignment_id JOIN classes c ON c.id_class=a.class_id WHERE s.student_id=? AND c.school_id=?`,
    [studentId, schoolId],
  );
  const [tasks] = await db.query(
    `SELECT a.*,c.nama_kelas,u.nama_lengkap AS guru,s.status,s.id_submission,g.nilai FROM assignments a JOIN classes c ON c.id_class=a.class_id JOIN student_classes sc ON sc.class_id=a.class_id AND sc.student_id=? JOIN users u ON u.id_user=a.teacher_id LEFT JOIN submissions s ON s.assignment_id=a.id_assignment AND s.student_id=? LEFT JOIN grades g ON g.id_grade=(SELECT g2.id_grade FROM grades g2 WHERE g2.submission_id=s.id_submission ORDER BY g2.graded_at DESC LIMIT 1) WHERE c.school_id=? ORDER BY a.deadline ASC LIMIT 5`,
    [studentId, studentId, schoolId],
  );
  const [announcementRows] = await db.query(
    `SELECT a.*,u.nama_lengkap AS guru FROM announcements a JOIN users u ON u.id_user=a.teacher_id WHERE a.school_id=? ORDER BY a.created_at DESC LIMIT 3`,
    [schoolId],
  );
  const [materialsRows] = await db.query(
    `SELECT m.*,c.nama_kelas,u.nama_lengkap AS guru FROM materials m JOIN classes c ON c.id_class=m.class_id JOIN student_classes sc ON sc.class_id=m.class_id AND sc.student_id=? JOIN users u ON u.id_user=m.teacher_id ORDER BY m.created_at DESC LIMIT 4`,
    [studentId],
  );
  return (
    <div className="space-y-4">
      <Banner role={role} name={name} schoolId={schoolId} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          href={`${schoolPrefix}/assignments`}
          icon={<ClipboardList />}
          value={pending.total || 0}
          label={
            <>
              Tugas Belum
              <br />
              Dikumpulkan
            </>
          }
          tone="red"
        />
        <StatCard
          href={`${schoolPrefix}/assignments`}
          icon={<CalendarDays />}
          value={deadlines.total || 0}
          label={
            <>
              Deadline
              <br />
              Minggu Ini
            </>
          }
          tone="blue"
        />
        <StatCard
          href="#pengumuman"
          icon={<Megaphone />}
          value={ann.total || 0}
          label={
            <>
              Pengumuman
              <br />
              Baru
            </>
          }
          tone="green"
        />
        <StatCard
          href={`${schoolPrefix}/grades`}
          icon={<BarChart3 />}
          value={avg.average || 0}
          label="Nilai Rata-rata"
          tone="purple"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Section
          title="Tugas yang Belum Dikumpulkan"
          action="Lihat Semua"
          actionHref={`${schoolPrefix}/assignments`}
        >
          <div className="space-y-2">
            {tasks.map((t, i) => {
              const done = !!t.id_submission;
              return (
                <Link
                  href={`${schoolPrefix}/assignments`}
                  key={t.id_assignment}
                  className="flex flex-col gap-2 rounded-xl border border-[#E3EDF8] p-3 transition hover:bg-[#F8FBFF] sm:flex-row sm:items-center"
                >
                  <span className="rounded-xl bg-blue-50 px-3 py-2 text-center text-sm font-semibold text-blue-600">
                    {t.nama_kelas}
                  </span>
                  <div className="flex-1">
                    <b className="text-sm text-[#102A72]">{t.judul}</b>
                    <div className="text-xs text-[#6176A8]">
                      {t.guru} •{" "}
                      {done
                        ? t.nilai != null
                          ? `Nilai ${Number(t.nilai).toFixed(0)}`
                          : "Sudah dikumpulkan"
                        : "Belum dikumpulkan"}
                    </div>
                  </div>
                  <div className="text-xs sm:text-right">
                    <div className="text-[#6176A8]">Deadline</div>
                    <b
                      className={
                        new Date(t.deadline) < new Date() && !done
                          ? "text-red-500"
                          : "text-[#15449E]"
                      }
                    >
                      {formatDate(t.deadline)}
                    </b>
                  </div>
                </Link>
              );
            })}
            {!tasks.length && (
              <div className="py-8 text-center text-sm text-[#7185AF]">
                Belum ada tugas.
              </div>
            )}
          </div>
        </Section>
        <Section
          title="Pengumuman Terbaru"
          action="Lihat Semua"
          actionHref="#pengumuman"
        >
          <div className="space-y-2">
            {announcementRows.map((a) => (
              <div
                key={a.id_announcement}
                className="border-b border-[#EEF3F8] py-3 last:border-0"
              >
                <b className="text-sm text-[#102A72]">{a.judul}</b>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#7185AF]">
                  {a.isi}
                </p>
                <div className="mt-1 text-[11px] text-[#9AA9C4]">
                  {formatDate(a.created_at)}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
      <Section
        title="Materi Pembelajaran Terbaru"
        action="Lihat Semua"
        actionHref={`${schoolPrefix}/materials`}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {materialsRows.map((m) => (
            <Link
              href={`${schoolPrefix}/materials`}
              key={m.id_material}
              className="rounded-xl border border-[#E2ECF7] p-3 transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-xs font-extrabold text-blue-600">
                {m.file_type || "FILE"}
              </div>
              <b className="mt-3 block text-sm text-[#102A72]">{m.judul}</b>
              <div className="mt-1 text-xs text-[#6176A8]">
                {m.nama_kelas} • {m.guru}
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}

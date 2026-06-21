import { useEffect, useState } from 'react';
import { GraduationCap, Award, Users, BookOpen, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardBody, Badge, Spinner } from '@/components/ui';
import { PageHeader, StatCard } from '@/components/common';
import { formatNumber } from '@/lib/utils';

interface Course {
  id: number;
  title: string;
  category: string;
  description: string;
  modules: number;
  duration: string;
  enrolled: number;
  completions: number;
  certificates: number;
  avg_progress: number;
}

export default function Training() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [summary, setSummary] = useState<{ enrollments: string; completions: string; certificates: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ courses: Course[]; summary: typeof summary }>('/training')
      .then((res) => {
        setCourses(res.courses);
        setSummary(res.summary);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Training & Capacity Building" subtitle="Climate-smart agriculture courses for farmers" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Enrollments" value={Number(summary?.enrollments || 0)} icon={Users} tint="forest" />
        <StatCard label="Course Completions" value={Number(summary?.completions || 0)} icon={CheckCircle2} tint="leaf" />
        <StatCard label="Certificates Issued" value={Number(summary?.certificates || 0)} icon={Award} tint="accent" />
        <StatCard label="Active Courses" value={courses.length} icon={BookOpen} tint="blue" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {courses.map((c) => (
          <Card key={c.id} className="transition hover:shadow-card">
            <CardBody className="pt-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest text-white">
                  <GraduationCap size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-ink">{c.title}</h3>
                    <Badge tone="gray">{c.category}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{c.description}</p>
                  <div className="mt-2 flex gap-4 text-xs text-slate-400">
                    <span>{c.modules} modules</span>
                    <span>{c.duration}</span>
                    <span>{formatNumber(c.enrolled)} enrolled</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-slate-500">Average progress</span>
                  <span className="font-semibold text-ink">{c.avg_progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-leaf" style={{ width: `${c.avg_progress}%` }} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-center">
                <div>
                  <div className="font-semibold text-ink">{formatNumber(c.completions)}</div>
                  <div className="text-xs text-slate-400">Completions</div>
                </div>
                <div>
                  <div className="font-semibold text-forest">{formatNumber(c.certificates)}</div>
                  <div className="text-xs text-slate-400">Certificates</div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}

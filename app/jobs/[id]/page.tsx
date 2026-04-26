import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getJobDetails } from '@/lib/mock-job-details';
import JobDetailClient from './JobDetailClient';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = getJobDetails(id);

  if (!job) {
    return { title: 'Job Not Found | BuildLinkPH' };
  }

  return {
    title: `${job.title} — ${job.discipline} Engineering Job | BuildLinkPH`,
    description: job.description,
  };
}

export default async function JobPage({ params }: Props) {
  const { id } = await params;
  const job = getJobDetails(id);

  if (!job) {
    notFound();
  }

  return <JobDetailClient job={job} />;
}

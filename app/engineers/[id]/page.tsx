import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getEngineerProfile } from '@/lib/mock-engineer-profiles';
import EngineerProfileView from './EngineerProfile';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const profile = getEngineerProfile(id);

  if (!profile) {
    return { title: 'Engineer Not Found | BuildLinkPH' };
  }

  return {
    title: `Engr. ${profile.firstName} ${profile.lastName} — ${profile.specialization} Engineer | BuildLinkPH`,
    description: `Hire Engr. ${profile.firstName} ${profile.lastName}, a ${profile.specialization.toLowerCase()} engineer based in ${profile.city}, ${profile.province} with ${profile.yearsExperience} years of experience. Rated ${profile.rating}/5 from ${profile.reviewCount} reviews.`,
  };
}

export default async function EngineerPage({ params }: Props) {
  const { id } = await params;
  const profile = getEngineerProfile(id);

  if (!profile) {
    notFound();
  }

  return <EngineerProfileView profile={profile} />;
}

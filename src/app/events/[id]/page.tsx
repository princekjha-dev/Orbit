import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/helpers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, ExternalLink, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { EventRegisterButton } from "@/components/events/event-register-button";
import type { Metadata } from "next";

interface PageProps { params: { id: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const event = await prisma.event.findUnique({ where: { id: params.id }, select: { title: true } });
  return { title: event?.title ?? "Event" };
}

export default async function EventDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();

  const [event, registration] = await Promise.all([
    prisma.event.findUnique({
      where: { id: params.id, isDeleted: false },
      include: { _count: { select: { registrations: true } } },
    }),
    user
      ? prisma.eventRegistration.findUnique({
          where: { eventId_userId: { eventId: params.id, userId: user.id! } },
        })
      : null,
  ]);

  if (!event) notFound();

  const start = new Date(event.startDate);
  const regDeadlinePassed =
    event.registrationDeadline && new Date(event.registrationDeadline) < new Date();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to events
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-neutral-100 border border-neutral-200 flex flex-col items-center justify-center flex-shrink-0 text-center">
                <p className="text-xs font-bold text-neutral-500">
                  {start.toLocaleDateString("en", { month: "short" }).toUpperCase()}
                </p>
                <p className="text-xl font-bold text-neutral-900">{start.getDate()}</p>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-neutral-900">{event.title}</h1>
                <p className="text-sm text-neutral-500 mt-1">{event.organizerName}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="blue">
                    {event.type.replace("_", " ")}
                  </Badge>
                  <Badge variant={event.format === "ONLINE" ? "green" : "neutral"}>
                    {event.format}
                  </Badge>
                  {event.isFree ? (
                    <Badge variant="green">Free</Badge>
                  ) : (
                    <Badge variant="amber">{event.price || "Paid"}</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-neutral-100">
              <div className="flex items-start gap-2 text-sm text-neutral-700">
                <Calendar className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p>{formatDate(event.startDate)}</p>
                  {event.endDate && (
                    <p className="text-neutral-500">to {formatDate(event.endDate)}</p>
                  )}
                </div>
              </div>
              {(event.venue || event.city) && (
                <div className="flex items-start gap-2 text-sm text-neutral-700">
                  <MapPin className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    {event.venue && <p>{event.venue}</p>}
                    {event.city && <p className="text-neutral-500">{event.city}</p>}
                  </div>
                </div>
              )}
              {event.registrationDeadline && (
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <Clock className="h-4 w-4 text-neutral-400 flex-shrink-0" aria-hidden="true" />
                  Registration by {formatDate(event.registrationDeadline)}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-neutral-900 mb-3">About this event</h2>
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </Card>

          {event.eligibility && (
            <Card>
              <h2 className="text-sm font-semibold text-neutral-900 mb-2">Who can attend</h2>
              <p className="text-sm text-neutral-700 whitespace-pre-wrap">{event.eligibility}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            {registration ? (
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">You have saved this event</p>
                <p className="text-xs text-neutral-500">Check the organizer link below for registration.</p>
              </div>
            ) : regDeadlinePassed ? (
              <p className="text-sm text-neutral-500">Registration deadline has passed.</p>
            ) : (
              <>
                {user && <EventRegisterButton eventId={event.id} isRegistered={!!registration} />}
                {event.registrationUrl && (
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-1.5 w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    Register on organizer site
                  </a>
                )}
                {!user && (
                  <Link href="/login"><Button className="w-full">Sign in to save</Button></Link>
                )}
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

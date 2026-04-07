import RoutineDetailPage from "@/components/community/RoutineDetailPage";

type RoutineDetailRouteProps = Readonly<{
  params: Promise<{ locale: string; id: string }>;
}>;

export default async function RoutineDetailRoute({ params }: RoutineDetailRouteProps) {
  const { locale, id } = await params;
  const backPath = locale === "en" ? "/community" : "/community";

  return <RoutineDetailPage routineId={id} backPath={backPath} />;
}

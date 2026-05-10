"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { primaryCtaLanding } from "@/lib/ui/appButtonStyles";

export default function LandingClient() {
  const authSession = useAuth();
  const router = useRouter();

  return (
    <main className="flex min-h-dvh flex-col bg-zinc-50 text-zinc-900">
      <div className="my-auto">
        <section className="mx-auto w-full max-w-md px-4 pb-10 pt-10">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-emerald-600/90">
            CHOLOGBOOK
          </p>
          <h1 className="mt-3 text-center text-3xl font-semibold tracking-tight text-zinc-900">
            행동을 쌓아가며,
            <br />
            흐름을 만듭니다
          </h1>
          <p className="mt-5 text-center text-sm leading-relaxed text-zinc-600">
            초록북은{" "}
            <span className="font-semibold text-zinc-900">
              Patch(행동) → Minor(인지) → Major(흐름)
            </span>
            으로
          </p>
          <p className="text-center text-sm leading-relaxed text-zinc-600">
            변화를 만드는 앱입니다.
          </p>
        </section>

        <section className="bg-emerald-50/60">
          <div className="mx-auto w-full max-w-md px-4 py-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800/80">
              1) 행동 · Patch
            </p>
            <p className="mt-2 text-lg font-semibold text-zinc-900">
              오늘 행동을 이어가기
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700">
              가장 작은 행동을 손쉽게 기록합니다.
            </p>
          </div>
        </section>

        <section className="border-y border-blue-200/80 bg-blue-100/60">
          <div className="mx-auto w-full max-w-md px-4 py-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-900/60">
              2) 인지 · Minor
            </p>
            <p className="mt-2 text-lg font-semibold text-zinc-900">
              떠오른 생각을 한 줄로
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700">
              누적된 행동을 가볍게 돌아봅니다.
            </p>
          </div>
        </section>

        <section className="border-y border-amber-200/90 bg-amber-100/70">
          <div className="mx-auto w-full max-w-md px-4 py-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-900/70">
              3) 흐름 · Major
            </p>
            <p className="mt-2 text-lg font-semibold text-zinc-900">
              지금 흐름을 정리하기
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700">
              한 구간을 마감하고, 다음 버전으로 넘어갈 기준을 만듭니다.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md px-4 py-10">
          {authSession.user ? (
            <button
              type="button"
              onClick={() => router.push("/app/patch")}
              className={primaryCtaLanding}
            >
              나의 초록북 가기
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void authSession.signInWithGoogle()}
              disabled={authSession.isGooglePopupPending}
              className="w-full rounded-2xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-200/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {authSession.isGooglePopupPending
                ? "연결 중…"
                : "로그인하고 시작하기"}
            </button>
          )}
        </section>
      </div>
    </main>
  );
}

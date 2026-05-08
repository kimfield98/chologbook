"use client";

import Link from "next/link";
import { useAppContext } from "@/app/app/AppContext";
import { PUBLIC_OWNER_LABEL } from "@/lib/chologbook/publicOwner";

export default function ProfileTabPage() {
  const { effectiveViewMode, authSession } = useAppContext();

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-zinc-900">Profile</p>
          <div className="mt-3 h-px bg-zinc-200/70" />
          <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              계정
            </p>
            {authSession.user ? (
              <p className="mt-1 text-xs text-zinc-600">
                {authSession.user.email ?? authSession.userId}
              </p>
            ) : (
              <p className="mt-1 text-xs text-zinc-500">
                로그인하지 않았어요.
              </p>
            )}
          </div>

        <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 px-4 py-3 text-sm text-zinc-700">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-zinc-900">현재 모드</p>
            <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-zinc-700">
              {effectiveViewMode === "public" ? "운영자" : "내 초록북"}
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-700">
            {effectiveViewMode === "public"
              ? `${PUBLIC_OWNER_LABEL}을 보고 있어요.`
              : "내 초록북을 보고 있어요."}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-zinc-900">Blog</p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          흐름 속에서 다듬어진 생각과 글을 공유합니다.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {[
            "경제",
            "일&커리어",
            "개발",
            "일상",
          ].map((label) => (
            <span
              key={label}
              className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700"
            >
              {label}
            </span>
          ))}
        </div>

        <div className="mt-5">
          <Link
            href="/blog"
            className="block rounded-2xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Blog 열기
          </Link>
        </div>
      </div>
    </section>
  );
}


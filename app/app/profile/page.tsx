"use client";

import Link from "next/link";
import { useAppContext } from "@/app/app/AppContext";
import { PUBLIC_OWNER_LABEL } from "@/lib/chologbook/publicOwner";

export default function ProfileTabPage() {
  const { effectiveViewMode, authSession } = useAppContext();

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-zinc-900">Profile / Blog</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          이 공간은 “초록북 안에서 만들어진 생각과 글 전시”로 확장될 예정이에요.
        </p>

        <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 px-4 py-3 text-sm text-zinc-700">
          <p className="font-semibold text-zinc-900">현재 상태</p>
          <p className="mt-1 text-sm text-zinc-700">
            {effectiveViewMode === "public"
              ? `${PUBLIC_OWNER_LABEL}을 보고 있어요.`
              : "내 초록북을 보고 있어요."}
          </p>
          {authSession.user ? (
            <p className="mt-1 text-xs text-zinc-500">
              {authSession.user.email ?? authSession.userId}
            </p>
          ) : (
            <p className="mt-1 text-xs text-zinc-500">로그인하지 않았어요.</p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center">
          <Link
            href="/blog"
            className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Blog 열기
          </Link>
        </div>
      </div>
    </section>
  );
}


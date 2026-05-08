"use client";

import Link from "next/link";
import { useAppContext } from "@/app/app/AppContext";
import { PUBLIC_OWNER_LABEL } from "@/lib/chologbook/publicOwner";

export default function ProfileTabPage() {
  const { authSession } = useAppContext();

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
            <p className="mt-1 text-xs text-zinc-500">로그인하지 않았어요.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-zinc-900">
            {PUBLIC_OWNER_LABEL}
          </p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          운영자의 흐름과 글을 구경할 수 있어요.
        </p>
        <div className="mt-5">
          <Link
            href="/tour/patch"
            className="block rounded-2xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            {PUBLIC_OWNER_LABEL} 구경하기
          </Link>
        </div>
      </div>
    </section>
  );
}


"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ✅ Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AuctionSections() {
  const [auctionId, setAuctionId] = useState<string | null>(null);
  const [sections, setSections] = useState<
    { title: string; html: string; documents: { file_url: string; file_name: string }[] }[]
  >([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("auction_id");
      setAuctionId(id);
    }
  }, []);

  useEffect(() => {
    const fetchSections = async () => {
      if (!auctionId) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("auctions")
        .select("detailed_sections")
        .eq("id", auctionId)
        .single();

      if (error) console.error("Error fetching sections:", error);
      if (data?.detailed_sections) setSections(data.detailed_sections);
      setLoading(false);
    };

    fetchSections();
  }, [auctionId]);

  const activeSection = sections[activeIndex] || null;

  if (loading)
    return (
      <div className="flex items-center justify-center py-20 text-gray-500 text-sm">
        Loading detailed sections...
      </div>
    );

  if (!auctionId)
    return (
      <div className="flex items-center justify-center py-20 text-gray-500 text-sm">
        Missing auction ID. Please open a valid auction detail page.
      </div>
    );

  if (!sections.length)
    return (
      <div className="bg-white border rounded-lg shadow-sm p-8 text-center text-gray-500 text-sm">
        No detailed sections are available for this auction yet.
      </div>
    );

  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden mt-8">
      {/* Header */}
      <div className="border-b bg-gray-50 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          Detailed Auction Sections
        </h2>
        <div className="text-sm text-gray-500">
          {sections.length} section{sections.length > 1 && "s"}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="lg:w-1/4 border-b lg:border-b-0 lg:border-r bg-white">
          <ul className="divide-y divide-gray-100">
            {sections.map((sec, idx) => (
              <li key={idx}>
                <button
                  onClick={() => setActiveIndex(idx)}
                  className={`w-full text-left px-5 py-3 text-sm transition-colors duration-150 ${
                    idx === activeIndex
                      ? "bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {sec.title || `Section ${idx + 1}`}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 bg-gray-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold mb-5 text-gray-800">
              {activeSection?.title || "Untitled Section"}
            </h3>

            {/* Rich HTML Content */}
            <div
              className="prose prose-gray max-w-none tiptap-view text-[15px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: activeSection.html }}
            />

            {/* Documents */}
            {activeSection?.documents?.length > 0 && (
              <div className="mt-8 border-t pt-5">
                <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span>📎</span> Attached Documents
                </h4>
                <ul className="list-disc ml-6 space-y-2">
                  {activeSection.documents.map((doc, i) => (
                    <li key={i}>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {doc.file_name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* TipTap content style tweaks */}
      <style jsx global>{`
        .tiptap-view ul {
          list-style-type: disc;
          margin-left: 1.5rem;
        }
        .tiptap-view ol {
          list-style-type: decimal;
          margin-left: 1.5rem;
        }
        .tiptap-view li {
          margin-bottom: 0.4rem;
        }
        .tiptap-view h1,
        .tiptap-view h2,
        .tiptap-view h3 {
          font-weight: 600;
          color: #1f2937;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .tiptap-view p {
          margin-bottom: 0.8rem;
          line-height: 1.7;
          color: #374151;
        }
        @media (min-width: 1024px) {
          .tiptap-view {
            columns: 2;
            column-gap: 3rem;
          }
        }
      `}</style>
    </div>
  );
}

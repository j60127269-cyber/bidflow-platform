"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface ProcuringEntity {
  id: string;
  entity_name: string;
  entity_type: string;
  contact_email?: string;
  website?: string;
}

export default function TestAgenciesPage() {
  const [agencies, setAgencies] = useState<ProcuringEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAgencies() {
      try {
        const { data, error } = await supabase
          .from("procuring_entities")
          .select("*")
          .order("entity_name");

        if (error) throw error;
        setAgencies(data || []);
      } catch (error) {
        console.error("Error fetching agencies:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAgencies();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agencies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Agencies</h1>
      
      {agencies.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">No Agencies Found</h2>
          <p className="text-gray-600 mb-6">
            It looks like there are no agencies in the database. You may need to:
          </p>
          <div className="space-y-2 text-left max-w-md mx-auto">
            <p className="text-sm text-gray-600">1. Set up your environment variables</p>
            <p className="text-sm text-gray-600">2. Run the database scripts</p>
            <p className="text-sm text-gray-600">3. Populate sample data</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {agencies.map((agency) => (
            <div key={agency.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{agency.entity_name}</h3>
                  <p className="text-sm text-gray-600">Type: {agency.entity_type}</p>
                  {agency.contact_email && (
                    <p className="text-sm text-gray-600">Email: {agency.contact_email}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">ID: {agency.id}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/dashboard/agencies/${agency.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    View by ID
                  </Link>
                  <Link
                    href={`/dashboard/agencies/${agency.entity_name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    View by Name
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

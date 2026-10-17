"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Network,
  ListFilter,
  Search,
  ExternalLink,
  ShieldCheck,
  Building2,
  User,
  FolderKanban,
  Rocket,
  Calendar,
  Users,
  Briefcase,
  ArrowRight,
  ChevronRight,
  Filter,
} from "lucide-react";

interface EcosystemNode {
  id: string;
  label: string;
  type: "USER" | "ORGANIZATION" | "PROJECT" | "EVENT" | "COMMUNITY" | "STARTUP" | "OPPORTUNITY";
  subtitle?: string;
  url?: string;
  verified?: boolean;
}

interface EcosystemEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
}

export default function EcosystemPage() {
  const [nodes, setNodes] = useState<EcosystemNode[]>([]);
  const [edges, setEdges] = useState<EcosystemEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"graph" | "list">("graph");

  useEffect(() => {
    async function fetchEcosystem() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedType !== "ALL") queryParams.set("type", selectedType);
        if (searchQuery) queryParams.set("q", searchQuery);

        const res = await fetch(`/api/ecosystem/map?${queryParams.toString()}`);
        if (!res.ok) throw new Error("Failed to load ecosystem data");
        const data = await res.json();
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        if (data.nodes?.length > 0 && !activeNodeId) {
          setActiveNodeId(data.nodes[0].id);
        }
      } catch (err) {
        console.error("Error fetching ecosystem map:", err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchEcosystem, 250);
    return () => clearTimeout(timer);
  }, [selectedType, searchQuery]);

  // Lookup node by ID
  const nodeMap = useMemo(() => {
    const map = new Map<string, EcosystemNode>();
    for (const n of nodes) {
      map.set(n.id, n);
    }
    return map;
  }, [nodes]);

  const activeNode = activeNodeId ? nodeMap.get(activeNodeId) : null;

  // Connected edges for the active node
  const activeConnections = useMemo(() => {
    if (!activeNodeId) return { inbound: [], outbound: [] };
    const inbound = edges
      .filter((e) => e.target === activeNodeId)
      .map((e) => ({
        ...e,
        connectedNode: nodeMap.get(e.source),
      }))
      .filter((e) => e.connectedNode);

    const outbound = edges
      .filter((e) => e.source === activeNodeId)
      .map((e) => ({
        ...e,
        connectedNode: nodeMap.get(e.target),
      }))
      .filter((e) => e.connectedNode);

    return { inbound, outbound };
  }, [activeNodeId, edges, nodeMap]);

  const getNodeIcon = (type: EcosystemNode["type"]) => {
    switch (type) {
      case "ORGANIZATION":
        return <Building2 className="h-4 w-4 text-blue-600" />;
      case "USER":
        return <User className="h-4 w-4 text-neutral-700" />;
      case "PROJECT":
        return <FolderKanban className="h-4 w-4 text-amber-600" />;
      case "STARTUP":
        return <Rocket className="h-4 w-4 text-emerald-600" />;
      case "EVENT":
        return <Calendar className="h-4 w-4 text-indigo-600" />;
      case "COMMUNITY":
        return <Users className="h-4 w-4 text-teal-600" />;
      case "OPPORTUNITY":
        return <Briefcase className="h-4 w-4 text-slate-600" />;
      default:
        return <Network className="h-4 w-4 text-neutral-500" />;
    }
  };

  const getBadgeVariant = (type: EcosystemNode["type"]) => {
    switch (type) {
      case "ORGANIZATION":
        return "blue";
      case "USER":
        return "neutral";
      case "PROJECT":
        return "amber";
      case "STARTUP":
        return "green";
      default:
        return "neutral";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <Network className="h-6 w-6 text-neutral-800" />
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Ecosystem Navigator</h1>
          </div>
          <p className="mt-1 text-sm text-neutral-600">
            Navigate verified relationships connecting founders, organizations, projects, opportunities, and communities.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-1">
            <button
              onClick={() => setViewMode("graph")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === "graph" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Interactive Map
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === "list" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Directory List
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {["ALL", "ORGANIZATION", "USER", "PROJECT", "STARTUP", "EVENT", "COMMUNITY", "OPPORTUNITY"].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                selectedType === t
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {t === "ALL" ? "All Nodes" : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter entities..."
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="mt-12 text-center py-16">
          <p className="text-sm text-neutral-500">Loading ecosystem connections...</p>
        </div>
      ) : nodes.length === 0 ? (
        <div className="mt-12 text-center py-16 bg-neutral-50 border border-neutral-200 rounded-xl">
          <Network className="mx-auto h-8 w-8 text-neutral-400" />
          <h3 className="mt-2 text-sm font-semibold text-neutral-900">No matching connections found</h3>
          <p className="mt-1 text-xs text-neutral-500">
            Try adjusting your search criteria or selecting All Nodes.
          </p>
        </div>
      ) : viewMode === "graph" ? (
        /* Practical Graph Navigator with Split Inspector */
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Node Grid View */}
          <div className="lg:col-span-8 bg-neutral-50/60 border border-neutral-200 rounded-xl p-5 min-h-[500px]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200 text-xs text-neutral-500">
              <span>{nodes.length} ecosystem nodes discovered</span>
              <span>Click a node to inspect verified connections</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[640px] overflow-y-auto pr-1">
              {nodes.map((node) => {
                const isSelected = activeNodeId === node.id;
                const connectionCount = edges.filter(
                  (e) => e.source === node.id || e.target === node.id
                ).length;

                return (
                  <div
                    key={node.id}
                    onClick={() => setActiveNodeId(node.id)}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "bg-white border-neutral-900 shadow-sm ring-1 ring-neutral-900"
                        : "bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-neutral-100">
                          {getNodeIcon(node.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-neutral-900 line-clamp-1">
                              {node.label}
                            </span>
                            {node.verified && (
                              <ShieldCheck className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                          {node.subtitle && (
                            <p className="text-xs text-neutral-500 line-clamp-1">
                              {node.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant={getBadgeVariant(node.type)}>
                        {node.type}
                      </Badge>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                      <span>{connectionCount} connection{connectionCount === 1 ? "" : "s"}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connection Inspector Sidebar */}
          <div className="lg:col-span-4 bg-white border border-neutral-200 rounded-xl p-5 sticky top-20 shadow-sm">
            {activeNode ? (
              <div>
                <div className="pb-4 border-b border-neutral-100">
                  <div className="flex items-center justify-between">
                    <Badge variant={getBadgeVariant(activeNode.type)}>
                      {activeNode.type}
                    </Badge>
                    {activeNode.verified && (
                      <span className="inline-flex items-center gap-1 text-xs text-blue-700 font-medium">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    )}
                  </div>
                  <h2 className="mt-2 text-lg font-bold text-neutral-900">{activeNode.label}</h2>
                  {activeNode.subtitle && (
                    <p className="text-xs text-neutral-600 mt-0.5">{activeNode.subtitle}</p>
                  )}

                  {activeNode.url && (
                    <div className="mt-3">
                      <Link href={activeNode.url}>
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                          View Resource Profile
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Relationships */}
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                      Connected To ({activeConnections.outbound.length})
                    </h3>
                    {activeConnections.outbound.length === 0 ? (
                      <p className="mt-1 text-xs text-neutral-400">No outbound links recorded.</p>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {activeConnections.outbound.map((conn) => (
                          <li
                            key={conn.id}
                            onClick={() => conn.connectedNode && setActiveNodeId(conn.connectedNode.id)}
                            className="p-2 rounded-md bg-neutral-50 border border-neutral-200/80 hover:bg-neutral-100 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-neutral-900">
                                {conn.connectedNode?.label}
                              </span>
                              <span className="text-[10px] text-neutral-500 font-mono bg-neutral-200/60 px-1.5 py-0.5 rounded">
                                {conn.relationship}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                      Referenced By ({activeConnections.inbound.length})
                    </h3>
                    {activeConnections.inbound.length === 0 ? (
                      <p className="mt-1 text-xs text-neutral-400">No incoming links recorded.</p>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {activeConnections.inbound.map((conn) => (
                          <li
                            key={conn.id}
                            onClick={() => conn.connectedNode && setActiveNodeId(conn.connectedNode.id)}
                            className="p-2 rounded-md bg-neutral-50 border border-neutral-200/80 hover:bg-neutral-100 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-neutral-900">
                                {conn.connectedNode?.label}
                              </span>
                              <span className="text-[10px] text-neutral-500 font-mono bg-neutral-200/60 px-1.5 py-0.5 rounded">
                                {conn.relationship}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-neutral-400 text-xs">
                Select an entity from the navigator to inspect its ecosystem relationships.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Accessible Directory List View for Mobile & Screen Readers */
        <div className="mt-6 border border-neutral-200 rounded-xl overflow-hidden bg-white">
          <div className="divide-y divide-neutral-200">
            {nodes.map((node) => {
              const connectedEdges = edges.filter(
                (e) => e.source === node.id || e.target === node.id
              );
              return (
                <div key={node.id} className="p-4 hover:bg-neutral-50/60 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-neutral-100">
                        {getNodeIcon(node.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-neutral-900">{node.label}</span>
                          {node.verified && (
                            <ShieldCheck className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                        {node.subtitle && (
                          <span className="text-xs text-neutral-500">{node.subtitle}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={getBadgeVariant(node.type)}>
                        {node.type}
                      </Badge>
                      {node.url && (
                        <Link href={node.url}>
                          <Button size="sm" variant="outline" className="h-8 text-xs">
                            View <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {connectedEdges.length > 0 && (
                    <div className="mt-3 pl-8 flex flex-wrap gap-1.5">
                      {connectedEdges.map((e) => {
                        const otherId = e.source === node.id ? e.target : e.source;
                        const otherNode = nodeMap.get(otherId);
                        if (!otherNode) return null;
                        return (
                          <span
                            key={e.id}
                            className="inline-flex items-center gap-1 text-[11px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border border-neutral-200"
                          >
                            <span className="text-neutral-400">{e.relationship}:</span>
                            <span className="font-medium">{otherNode.label}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

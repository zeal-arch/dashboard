"use client";

import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/ui/Breadcrumbs/Breadcrumb";
import { fetchLoginHistory, LoginLog } from "@/lib/services/loginHistoryApi";
import { parseUserAgent, formatDeviceInfo, getDeviceIcon } from "@/admin/lib/utils/device-parser";
import { Badge } from "@/admin/components/Badge";
import { AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";

export default function LoginHistoryPage() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await fetchLoginHistory();
      setLogs(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(dateStr));
  };

  return (
    <div className="mx-auto w-full max-w-[1080px] space-y-6">
      <Breadcrumb pageName="Login History" />

      <div className="rounded-[10px] border border-gray-200 bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-dark dark:text-white">Security Logs</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Review your recent login activity and active sessions.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-dark-4 dark:text-dark-6">
              <thead className="bg-gray-100 text-xs uppercase text-dark dark:bg-dark-2 dark:text-white">
                <tr>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Device & Browser</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">IP Address</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-3">
                {logs.map((log) => {
                  const deviceInfo = parseUserAgent(log.userAgent);
                  const formattedDevice = formatDeviceInfo(deviceInfo);
                  const icon = getDeviceIcon(deviceInfo.deviceType);

                  return (
                    <tr
                      key={log.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <td className="whitespace-nowrap px-4 py-4 font-medium text-dark dark:text-white">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl" title={deviceInfo.deviceType}>{icon}</span>
                          <div>
                            <p className="font-medium text-dark dark:text-white">
                              {formattedDevice}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] truncate" title={log.userAgent}>
                              {deviceInfo.browser} on {deviceInfo.os}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                        {log.location}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                        {log.ipAddress}
                      </td>
                      <td className="px-4 py-4">
                        {log.status === "success" ? (
                          <Badge variant="default" className="flex w-fit items-center gap-1 bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Success
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="flex w-fit items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Failed
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {log.riskLevel === "high" ? (
                          <span className="flex items-center gap-1 font-medium text-red-600 dark:text-red-400">
                            <ShieldAlert className="h-4 w-4" />
                            High
                          </span>
                        ) : log.riskLevel === "medium" ? (
                          <span className="font-medium text-amber-600 dark:text-amber-400">Medium</span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">Low</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

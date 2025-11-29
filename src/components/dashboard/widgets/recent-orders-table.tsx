"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const orders = [
  { id: "#ORD789ABC", payment: "Rupay Card ****2783", type: "Card Payment", status: "Completed", amount: "$1,234.78", date: "Nov 22,2023" },
  { id: "#ORD253SFW", payment: "Digital Wallet", type: "Online Transaction", status: "Pending", amount: "$623.99", date: "Nov 22,2023" },
  { id: "#ORD356SKF", payment: "Maestro Card ****7893", type: "Card Payment", status: "Cancelled", amount: "$1,324", date: "Nov 21,2023" },
  { id: "#ORD363ESO", payment: "Cash On Delivery", type: "Pay On Delivery", status: "Completed", amount: "$1,123.49", date: "Nov 20,2023" },
  { id: "#ORD253KSE", payment: "Visa Card ****2563", type: "Card Payment", status: "Completed", amount: "$1,289", date: "Nov 18,2023" },
];

import { ScifiCorner, ScifiScanline } from "@/components/dashboard/shared/scifi-decorations";

export function RecentOrdersTable() {
  return (
    <Card className="scifi-card h-full relative overflow-hidden group">
      <ScifiScanline />
      <ScifiCorner position="top-left" />
      <ScifiCorner position="top-right" />
      <ScifiCorner position="bottom-left" />
      <ScifiCorner position="bottom-right" />

      <CardHeader className="relative z-10">
        <CardTitle className="text-base font-semibold text-white drop-shadow-[0_0_8px_rgba(0,242,255,0.4)]">
          Recent Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative z-10">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-primary/20 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Order ID</TableHead>
              <TableHead className="text-muted-foreground">Payment Mode</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-right text-muted-foreground">Amount Paid</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                <TableCell className="font-medium text-white">{order.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-white">{order.payment}</span>
                    <span className="text-xs text-muted-foreground">{order.type}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`
                      ${order.status === 'Completed' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : ''}
                      ${order.status === 'Pending' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : ''}
                      ${order.status === 'Cancelled' ? 'border-rose-500/50 text-rose-400 bg-rose-500/10' : ''}
                      border backdrop-blur-sm
                    `}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col">
                    <span className="font-bold text-white">{order.amount}</span>
                    <span className="text-xs text-muted-foreground">{order.date}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

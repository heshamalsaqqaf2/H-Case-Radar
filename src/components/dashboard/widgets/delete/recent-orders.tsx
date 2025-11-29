"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const orders = [
  {
    id: "#ORD789ABC",
    paymentMode: "Rupay Card ****2783",
    paymentType: "Card Payment",
    status: "Completed",
    amount: "$1,234.78",
    date: "Nov 22, 2023",
  },
  {
    id: "#ORD253SFW",
    paymentMode: "Digital Wallet",
    paymentType: "Online Transaction",
    status: "Pending",
    amount: "$623.99",
    date: "Nov 22, 2023",
  },
  {
    id: "#ORD356SKF",
    paymentMode: "Maestro Card ****7893",
    paymentType: "Card Payment",
    status: "Cancelled",
    amount: "$1,324",
    date: "Nov 21, 2023",
  },
  {
    id: "#ORD363ESO",
    paymentMode: "Cash On Delivery",
    paymentType: "Pay On Delivery",
    status: "Completed",
    amount: "$1,123.49",
    date: "Nov 20, 2023",
  },
  {
    id: "#ORD253KSE",
    paymentMode: "Visa Card ****2563",
    paymentType: "Card Payment",
    status: "Completed",
    amount: "$1,289",
    date: "Nov 18, 2023",
  },
];

export function RecentOrders() {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      Pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      Cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
    };
    return variants[status] || "";
  };

  return (
    <Card className="scifi-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-primary drop-shadow-[0_0_8px_rgba(0,242,255,0.4)]">Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/30">
              <TableHead className="text-muted-foreground text-xs font-semibold">Order ID</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Payment Mode</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Payment Type</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Status</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold text-right">Amount</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-primary/5 border-b border-border/20 transition-colors">
                <TableCell className="font-semibold text-primary text-xs">{order.id}</TableCell>
                <TableCell className="text-xs text-foreground/90">{order.paymentMode}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{order.paymentType}</TableCell>
                <TableCell>
                  <Badge
                    className={`text-[10px] font-semibold px-2 py-0.5 border ${getStatusBadge(order.status)}`}
                    variant="outline"
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-bold text-white text-xs text-right">{order.amount}</TableCell>
                <TableCell className="text-xs text-muted-foreground text-right">{order.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

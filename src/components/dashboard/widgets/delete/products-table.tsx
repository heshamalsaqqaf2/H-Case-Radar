"use client";

import { IconSearch, IconSortDescending } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const products = [
  {
    name: "Niker College Bag",
    id: "#1734-9743",
    price: "$199.99",
    status: "Available",
    sales: "3,903",
    revenue: "$67,899.24",
    image: "/images/products/bag.png", // Placeholder
  },
  {
    name: "Dslr Camera (50mm f/1.9 HRM Lens)",
    id: "#1234-4567",
    price: "$1,299.99",
    status: "Available",
    sales: "12,435",
    revenue: "$3,24,781.92",
    image: "/images/products/camera.png",
  },
  {
    name: "Outdoor Bomber Jacket",
    id: "#1902-9883",
    price: "$99.99",
    status: "Not Available",
    sales: "5,143",
    revenue: "$76,102.76",
    image: "/images/products/jacket.png",
  },
  {
    name: "Light Yellow Teddy",
    id: "#8745-1232",
    price: "$79.00",
    status: "Limited Deal",
    sales: "7,183",
    revenue: "$78,211.83",
    image: "/images/products/teddy.png",
  },
  {
    name: "Orange Smart Watch (24mm)",
    id: "#1962-9033",
    price: "$199.99",
    status: "In Offer",
    sales: "10,287",
    revenue: "$2,32,982.99",
    image: "/images/products/watch.png",
  },
];

export function ProductsTable() {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Available: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      "Not Available": "bg-red-500/15 text-red-400 border-red-500/30",
      "Limited Deal": "bg-amber-500/15 text-amber-400 border-amber-500/30",
      "In Offer": "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    };
    return variants[status] || "";
  };

  return (
    <Card className="scifi-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-primary drop-shadow-[0_0_8px_rgba(0,242,255,0.4)]">Products Overview</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="pl-8 h-9 w-[180px] bg-secondary/50 border-primary/20 text-white placeholder:text-muted-foreground focus:border-primary/40 transition-colors"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 border-primary/20 text-primary hover:bg-primary/10 hover:border-primary/40 transition-all"
          >
            Sort By <IconSortDescending className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/30">
              <TableHead className="text-muted-foreground text-xs font-semibold">Name</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Product Id</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold text-right">Price</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold text-center">Status</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold text-right">Sales</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="hover:bg-primary/5 border-b border-border/20 transition-colors">
                <TableCell className="font-medium text-white text-sm flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-md bg-gradient-to-br from-secondary to-secondary/40 border border-primary/10" />
                  <span className="line-clamp-1">{product.name}</span>
                </TableCell>
                <TableCell className="text-xs text-primary font-semibold">{product.id}</TableCell>
                <TableCell className="font-semibold text-white text-xs text-right">{product.price}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    className={`text-[10px] font-semibold px-2.5 py-0.5 border ${getStatusBadge(product.status)}`}
                    variant="outline"
                  >
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-foreground/80 text-right">{product.sales}</TableCell>
                <TableCell className="font-bold text-white text-xs text-right">{product.revenue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between mt-5 text-sm text-muted-foreground">
          <div className="text-xs">Showing 5 Entries →</div>
          <div className="flex gap-1.5">
            <Button variant="ghost" size="sm" disabled className="h-8 px-3 text-xs">
              Prev
            </Button>
            <Button variant="default" size="sm" className="h-8 px-3 text-xs bg-primary text-black hover:bg-primary/90 font-semibold shadow-[0_0_10px_rgba(0,242,255,0.3)]">
              1
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-3 text-xs hover:bg-primary/10">
              2
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-3 text-xs hover:bg-primary/10">
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

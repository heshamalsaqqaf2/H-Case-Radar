"use client";

import { IconSearch } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const products = [
  { name: "Niker College Bag", id: "#1734-9743", price: "$199.99", status: "Available", sales: "3,903", revenue: "$67,899.24", image: "/images/product1.jpg" },
  { name: "Dslr Camera (50mm f/1.9 HRM Lens)", id: "#1234-4567", price: "$1,299.99", status: "Available", sales: "12,435", revenue: "$3,24,781.92", image: "/images/product2.jpg" },
  { name: "Outdoor Bomber Jacket", id: "#1902-9883", price: "$99.99", status: "Not Available", sales: "5,143", revenue: "$76,102.76", image: "/images/product3.jpg" },
  { name: "Light Yellow Teddy", id: "#8745-1232", price: "$79.00", status: "Limited Deal", sales: "7,183", revenue: "$78,211.83", image: "/images/product4.jpg" },
  { name: "Orange Smart Watch (24mm)", id: "#1962-9033", price: "$199.99", status: "In Offer", sales: "10,287", revenue: "$2,32,982.99", image: "/images/product5.jpg" },
];

import { ScifiCorner, ScifiScanline } from "@/components/dashboard/shared/scifi-decorations";

export function ProductsOverviewTable() {
  return (
    <Card className="scifi-card h-full relative overflow-hidden group">
      <ScifiScanline />
      <ScifiCorner position="top-left" />
      <ScifiCorner position="top-right" />
      <ScifiCorner position="bottom-left" />
      <ScifiCorner position="bottom-right" />

      <CardHeader className="flex flex-row items-center justify-between relative z-10">
        <CardTitle className="text-base font-semibold text-white drop-shadow-[0_0_8px_rgba(0,242,255,0.4)]">
          Products Overview
        </CardTitle>
        <div className="flex gap-2">
          <div className="relative">
            <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search"
              className="w-[150px] rounded-md bg-[#111c2a] pl-8 h-9 text-xs outline-none focus:ring-1 focus:ring-primary border border-primary/20 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Select defaultValue="sort">
            <SelectTrigger className="w-[100px] h-9 text-xs bg-primary text-black border-none font-bold">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sort">Sort By</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price">Price</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative z-10">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-primary/20 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Product Id</TableHead>
              <TableHead className="text-muted-foreground">Price</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Sales</TableHead>
              <TableHead className="text-right text-muted-foreground">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                <TableCell className="font-medium text-white">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 rounded-md border border-primary/20">
                      <AvatarImage src={product.image} alt={product.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">IMG</AvatarFallback>
                    </Avatar>
                    <span>{product.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{product.id}</TableCell>
                <TableCell className="text-white">{product.price}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`
                      ${product.status === 'Available' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : ''}
                      ${product.status === 'Not Available' ? 'border-rose-500/50 text-rose-400 bg-rose-500/10' : ''}
                      ${product.status === 'Limited Deal' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : ''}
                      ${product.status === 'In Offer' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' : ''}
                      border backdrop-blur-sm text-[10px] px-2 py-0.5
                    `}
                  >
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-white">{product.sales}</TableCell>
                <TableCell className="text-right font-bold text-primary drop-shadow-[0_0_5px_rgba(0,242,255,0.3)]">
                  {product.revenue}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="p-4 flex items-center justify-between text-xs text-muted-foreground border-t border-primary/10">
          <span>Showing 5 Entries</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-6 text-xs hover:text-primary">Prev</Button>
            <Button size="sm" className="h-6 w-6 p-0 text-xs bg-primary text-black">1</Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-xs hover:text-primary">2</Button>
            <Button variant="ghost" size="sm" className="h-6 text-xs hover:text-primary">Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

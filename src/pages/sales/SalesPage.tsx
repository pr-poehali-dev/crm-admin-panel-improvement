
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { salesApi, Sale } from "@/components/api/apiClient";
import Icon from "@/components/ui/icon";
import { toast } from "@/components/ui/use-toast";

const SalesPage = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const response = await salesApi.getAll();
      if (response.data) {
        setSales(response.data);
      } else {
        toast({
          title: "Ошибка",
          description: response.error || "Не удалось загрузить продажи",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Ошибка при загрузке продаж:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить продажи",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSale = async (id: string) => {
    if (window.confirm("Вы уверены, что хотите удалить эту продажу?")) {
      try {
        const response = await salesApi.delete(id);
        if (response.status === 200) {
          setSales(sales.filter(sale => sale.id !== id));
          toast({
            title: "Успешно",
            description: "Продажа успешно удалена",
          });
        } else {
          toast({
            title: "Ошибка",
            description: response.error || "Не удалось удалить продажу",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Ошибка при удалении продажи:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось удалить продажу",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusBadge = (status: Sale['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Завершена</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">В процессе</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Отменена</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Фильтрация продаж по поисковому запросу
  const filteredSales = sales.filter(sale => 
    sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.amount.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Продажи</h2>
        <Button onClick={() => navigate("/sales/new")}>
          <Icon name="Plus" className="mr-2 h-4 w-4" />
          Добавить продажу
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Список продаж</CardTitle>
          <div className="flex items-center space-x-2 pt-2">
            <div className="relative flex-1">
              <Icon name="Search" className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск продаж..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Icon name="Loader2" className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>ID клиента</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Товары</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length > 0 ? (
                    filteredSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.id}</TableCell>
                        <TableCell>{sale.clientId}</TableCell>
                        <TableCell>{formatCurrency(sale.amount)}</TableCell>
                        <TableCell>{getStatusBadge(sale.status)}</TableCell>
                        <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                        <TableCell>{sale.products.length} товаров</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/sales/${sale.id}/edit`)}
                            >
                              <Icon name="Pencil" className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/sales/${sale.id}`)}
                            >
                              <Icon name="Eye" className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSale(sale.id)}
                            >
                              <Icon name="Trash" className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Продажи не найдены.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesPage;


import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { salesApi, clientsApi, Sale, Client } from "@/components/api/apiClient";
import Icon from "@/components/ui/icon";
import { toast } from "@/components/ui/use-toast";

interface ProductItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const SaleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id !== undefined && id !== "new";
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  
  const [formData, setFormData] = useState<Omit<Sale, 'id'>>({
    clientId: "",
    amount: 0,
    status: "pending",
    date: new Date().toISOString().split('T')[0],
    products: []
  });

  const [newProduct, setNewProduct] = useState<ProductItem>({
    id: "",
    name: "",
    price: 0,
    quantity: 1
  });

  useEffect(() => {
    fetchClients();
    if (isEditMode) {
      fetchSaleData();
    }
  }, [id]);

  const fetchClients = async () => {
    try {
      const response = await clientsApi.getAll();
      if (response.data) {
        setClients(response.data);
      }
    } catch (error) {
      console.error("Ошибка при загрузке клиентов:", error);
    }
  };

  const fetchSaleData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const response = await salesApi.getById(id);
      if (response.data) {
        setFormData(response.data);
      } else {
        toast({
          title: "Ошибка",
          description: response.error || "Не удалось загрузить данные продажи",
          variant: "destructive",
        });
        navigate("/sales");
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных продажи:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные продажи",
        variant: "destructive",
      });
      navigate("/sales");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProductChange = (field: keyof ProductItem, value: any) => {
    setNewProduct((prev) => ({
      ...prev,
      [field]: field === 'price' || field === 'quantity' ? Number(value) : value,
    }));
  };

  const addProduct = () => {
    if (!newProduct.name || newProduct.price <= 0 || newProduct.quantity <= 0) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля товара корректно",
        variant: "destructive",
      });
      return;
    }

    const productId = newProduct.id || `temp-${Date.now()}`;
    const newProductWithId = { ...newProduct, id: productId };
    
    const updatedProducts = [...formData.products, newProductWithId];
    
    // Обновляем общую сумму
    const totalAmount = updatedProducts.reduce(
      (sum, product) => sum + product.price * product.quantity, 
      0
    );
    
    setFormData((prev) => ({
      ...prev,
      products: updatedProducts,
      amount: totalAmount
    }));
    
    // Сбрасываем форму добавления товара
    setNewProduct({
      id: "",
      name: "",
      price: 0,
      quantity: 1
    });
  };

  const removeProduct = (productId: string) => {
    const updatedProducts = formData.products.filter(product => product.id !== productId);
    
    // Пересчитываем общую сумму
    const totalAmount = updatedProducts.reduce(
      (sum, product) => sum + product.price * product.quantity, 
      0
    );
    
    setFormData((prev) => ({
      ...prev,
      products: updatedProducts,
      amount: totalAmount
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId) {
      toast({
        title: "Ошибка",
        description: "Выберите клиента",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.products.length === 0) {
      toast({
        title: "Ошибка",
        description: "Добавьте хотя бы один товар",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      let response;
      if (isEditMode && id) {
        response = await salesApi.update(id, formData);
      } else {
        response = await salesApi.create(formData);
      }
      
      if (response.status >= 200 && response.status < 300) {
        toast({
          title: "Успешно",
          description: isEditMode 
            ? "Данные продажи успешно обновлены" 
            : "Продажа успешно создана",
        });
        navigate("/sales");
      } else {
        toast({
          title: "Ошибка",
          description: response.error || `Не удалось ${isEditMode ? 'обновить' : 'создать'} продажу`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Ошибка при ${isEditMode ? 'обновлении' : 'создании'} продажи:`, error);
      toast({
        title: "Ошибка",
        description: `Не удалось ${isEditMode ? 'обновить' : 'создать'} продажу`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Icon name="Loader2" className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate("/sales")} className="mb-4">
          <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
          Назад к списку
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {isEditMode ? "Редактирование продажи" : "Создание новой продажи"}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Клиент *</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => handleChange("clientId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.company})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Дата *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date.split('T')[0]}
                onChange={(e) => handleChange("date", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value as Sale['status'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">В процессе</SelectItem>
                  <SelectItem value="completed">Завершена</SelectItem>
                  <SelectItem value="canceled">Отменена</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Общая сумма</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                readOnly
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Сумма рассчитывается автоматически на основе добавленных товаров
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Товары</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border mb-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Количество</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.products.length > 0 ? (
                    formData.products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.price.toLocaleString()} ₽</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>{(product.price * product.quantity).toLocaleString()} ₽</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeProduct(product.id)}
                          >
                            <Icon name="Trash" className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Товары не добавлены. Добавьте товары к продаже.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <h4 className="text-sm font-semibold mb-3">Добавить товар</h4>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-5">
                  <Label htmlFor="productName">Название</Label>
                  <Input
                    id="productName"
                    value={newProduct.name}
                    onChange={(e) => handleProductChange("name", e.target.value)}
                    placeholder="Название товара"
                  />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="productPrice">Цена</Label>
                  <Input
                    id="productPrice"
                    type="number"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) => handleProductChange("price", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="productQuantity">Кол-во</Label>
                  <Input
                    id="productQuantity"
                    type="number"
                    min="1"
                    value={newProduct.quantity}
                    onChange={(e) => handleProductChange("quantity", e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div className="col-span-2 flex items-end">
                  <Button type="button" onClick={addProduct} className="w-full">
                    <Icon name="Plus" className="mr-2 h-4 w-4" />
                    Добавить
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardFooter className="flex justify-between py-6">
            <Button variant="outline" onClick={() => navigate("/sales")}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Сохранить изменения" : "Создать продажу"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default SaleForm;

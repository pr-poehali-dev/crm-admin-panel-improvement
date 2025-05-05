
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clientsApi, Client } from "@/components/api/apiClient";
import Icon from "@/components/ui/icon";
import { toast } from "@/components/ui/use-toast";

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id !== undefined && id !== "new";
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Client, 'id' | 'createdAt'>>({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "lead",
  });

  useEffect(() => {
    if (isEditMode) {
      fetchClientData();
    }
  }, [id]);

  const fetchClientData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const response = await clientsApi.getById(id);
      if (response.data) {
        // Извлекаем только нужные для формы поля
        const { name, email, phone, company, status } = response.data;
        setFormData({ name, email, phone, company, status });
      } else {
        toast({
          title: "Ошибка",
          description: response.error || "Не удалось загрузить данные клиента",
          variant: "destructive",
        });
        navigate("/clients");
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных клиента:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные клиента",
        variant: "destructive",
      });
      navigate("/clients");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Валидация полей
      if (!formData.name || !formData.email) {
        toast({
          title: "Ошибка валидации",
          description: "Имя и Email обязательны для заполнения",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      
      let response;
      if (isEditMode && id) {
        response = await clientsApi.update(id, formData);
      } else {
        response = await clientsApi.create(formData);
      }
      
      if (response.status >= 200 && response.status < 300) {
        toast({
          title: "Успешно",
          description: isEditMode 
            ? "Данные клиента успешно обновлены" 
            : "Клиент успешно создан",
        });
        navigate("/clients");
      } else {
        toast({
          title: "Ошибка",
          description: response.error || `Не удалось ${isEditMode ? 'обновить' : 'создать'} клиента`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Ошибка при ${isEditMode ? 'обновлении' : 'создании'} клиента:`, error);
      toast({
        title: "Ошибка",
        description: `Не удалось ${isEditMode ? 'обновить' : 'создать'} клиента`,
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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate("/clients")} className="mb-4">
          <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
          Назад к списку
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {isEditMode ? "Редактирование клиента" : "Создание нового клиента"}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Информация о клиенте</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Введите имя клиента"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Компания</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                placeholder="Название компании"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value as Client['status'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Лид</SelectItem>
                  <SelectItem value="active">Активный</SelectItem>
                  <SelectItem value="inactive">Неактивный</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/clients")}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Сохранить изменения" : "Создать клиента"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default ClientForm;


import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tasksApi, Task } from "@/components/api/apiClient";
import Icon from "@/components/ui/icon";
import { toast } from "@/components/ui/use-toast";

const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id !== undefined && id !== "new";
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Task, 'id'>>({
    title: "",
    description: "",
    status: "todo",
    assignedTo: "",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 дней от сегодня
    priority: "medium"
  });

  useEffect(() => {
    if (isEditMode) {
      fetchTaskData();
    }
  }, [id]);

  const fetchTaskData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const response = await tasksApi.getById(id);
      if (response.data) {
        // Преобразуем дату для поля ввода
        const taskData = response.data;
        if (taskData.dueDate) {
          taskData.dueDate = taskData.dueDate.split('T')[0];
        }
        setFormData(taskData);
      } else {
        toast({
          title: "Ошибка",
          description: response.error || "Не удалось загрузить данные задачи",
          variant: "destructive",
        });
        navigate("/tasks");
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных задачи:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные задачи",
        variant: "destructive",
      });
      navigate("/tasks");
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
      if (!formData.title || !formData.dueDate) {
        toast({
          title: "Ошибка валидации",
          description: "Название и срок выполнения обязательны для заполнения",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      
      let response;
      if (isEditMode && id) {
        response = await tasksApi.update(id, formData);
      } else {
        response = await tasksApi.create(formData);
      }
      
      if (response.status >= 200 && response.status < 300) {
        toast({
          title: "Успешно",
          description: isEditMode 
            ? "Задача успешно обновлена" 
            : "Задача успешно создана",
        });
        navigate("/tasks");
      } else {
        toast({
          title: "Ошибка",
          description: response.error || `Не удалось ${isEditMode ? 'обновить' : 'создать'} задачу`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Ошибка при ${isEditMode ? 'обновлении' : 'создании'} задачи:`, error);
      toast({
        title: "Ошибка",
        description: `Не удалось ${isEditMode ? 'обновить' : 'создать'} задачу`,
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
        <Button variant="outline" onClick={() => navigate("/tasks")} className="mb-4">
          <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
          Назад к списку
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {isEditMode ? "Редактирование задачи" : "Создание новой задачи"}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Информация о задаче</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название задачи *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Введите название задачи"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Подробное описание задачи..."
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Статус</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange("status", value as Task['status'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">К выполнению</SelectItem>
                    <SelectItem value="in_progress">В процессе</SelectItem>
                    <SelectItem value="done">Завершена</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Приоритет</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleChange("priority", value as Task['priority'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите приоритет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Низкий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Ответственный</Label>
                <Input
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => handleChange("assignedTo", e.target.value)}
                  placeholder="Имя ответственного"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">Срок выполнения *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange("dueDate", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/tasks")}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Сохранить изменения" : "Создать задачу"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default TaskForm;

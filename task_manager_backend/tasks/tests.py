from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import Task

class TaskAPITests(APITestCase):
    def setUp(self):
        self.username = "testuser"
        self.email = "test@example.com"
        self.password = "testpass123"
        self.user = User.objects.create_user(username=self.username, email=self.email, password=self.password)
        self.task = Task.objects.create(user=self.user, title="Existing Task", description="Some details", completed=False)
        
        # URL endpoints
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.task_list_url = reverse('task-list')

    def test_register_user(self):
        data = {
            "username": "newuser",
            "email": "new@example.com",
            "password": "newpassword"
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'newuser')

    def test_login_user(self):
        data = {
            "username": self.username,
            "password": self.password
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_get_tasks_authenticated(self):
        login_data = {"username": self.username, "password": self.password}
        token_response = self.client.post(self.login_url, login_data, format='json')
        token = token_response.data['token']
        
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        response = self.client.get(self.task_list_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], "Existing Task")
        self.assertEqual(response.data[0]['completed'], False)

    def test_create_task(self):
        login_data = {"username": self.username, "password": self.password}
        token_response = self.client.post(self.login_url, login_data, format='json')
        token = token_response.data['token']
        
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        data = {
            "title": "New Task Title",
            "description": "New Task Desc"
        }
        response = self.client.post(self.task_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], "New Task Title")
        self.assertEqual(response.data['completed'], False)

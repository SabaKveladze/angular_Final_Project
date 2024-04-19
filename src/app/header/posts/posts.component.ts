import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalstorageService } from 'src/app/services/localstorage.service';
import { User } from '../../interfaces/user.interface';
import { Body } from '../../interfaces/body.interface';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
})
export class PostsComponent implements OnInit {
  isActive: boolean = false;
  openPostForm() {
    this.isActive = !this.isActive;
  }

  goToPost(postId: number): void {
    this.router.navigate(['/posts', postId]);
  }
  isEditModalOpen = false;
  users!: User[];
  bodyText!: Body[];
  addPostForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private localstorageService: LocalstorageService,
    private apiService: ApiService,
    private router: Router
  ) {
    this.addPostForm = this.fb.group({
      title: ['', [Validators.required]],
      body: ['', [Validators.required]],
      author: ['', [Validators.required]],
    });
  }
  openEditModal(post: PostsComponent) {
    this.isEditModalOpen = true;
  }
  onSubmit(formValue: any) {
    this.users = [
      {
        id: this.bodyText.length + 1,
        name: formValue.author,
        body: '',
        username: '',
      },
      ...this.users,
    ];
    this.bodyText = [
      {
        userId: this.bodyText.length + 1,
        id: this.bodyText.length + 1,
        title: formValue.title,
        body: formValue.body,
      },
      ...this.bodyText,
    ];

    // this.localstorageService.saveData(title, value.title);
    // this.localstorageService.saveData(body, value.body);
    // this.localstorageService.saveData(user, value.user);
  }
  get title() {
    return this.addPostForm.get('title');
  }
  get body() {
    return this.addPostForm.get('body');
  }
  get author() {
    return this.addPostForm.get('author');
  }
  newUser = '';
  storage = 'local-app';

  saveToLocalStorage(newPost: any) {
    let posts = JSON.parse(localStorage.getItem('posts') || '[]');
    posts.push(newPost);
    localStorage.setItem('posts', JSON.stringify(posts));
  }

  getUserName(userId: number): String {
    const user = this.users?.find((user) => user.id === userId);
    return user ? user.name : '';
  }

  addNewPost(postUser: String, postTitle: String, postBody: String) {
    if (!postUser.trim() || !postTitle.trim() || !postBody.trim()) {
      return;
    }

    const newPost = {
      userId: this.users.length + 1,
      userName: postUser.trim(),
      title: postTitle.trim(),
      body: postBody.trim(),
      id: this.bodyText.length + 1,
    };

    this.apiService.addNewUser(newPost).subscribe(
      (response) => {
        console.log('New user and post added successfully:', response);
        this.saveToLocalStorage(newPost);

        this.bodyText.push(newPost);

        this.addPostForm.reset();
      },
      (error) => {
        console.error('Error adding new user and post:', error);
      }
    );
  }

  ngOnInit(): void {
    this.apiService.getUsers().subscribe((users) => {
      this.users = users;
    });

    this.apiService.getBody().subscribe((bodyText) => {
      this.bodyText = bodyText;
    });
  }
}

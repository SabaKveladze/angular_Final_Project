import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Comments } from 'src/app/interfaces/comments.interface';
import { ApiService } from 'src/app/services/api.service';
import { Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Body } from '../../../interfaces/body.interface';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
})
export class CommentsComponent implements OnInit {
  comments!: Comments[];
  addCommentForm: FormGroup;
  bodyData!: Body[];
  postTitle: String = '';
  postBody: String = '';
  parseNumber!: number;
  postId!: number;
  editedTitle: String = '';
  editedBody: String = '';
  comments$: Observable<Comments[]> | null = null;
  resolvedComments: Comments[] = [];
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.addCommentForm = this.fb.group({
      userName: ['', [Validators.required]],
      body: ['', [Validators.required]],
    });
  }

  saveToLocalStorage(newComment: any) {
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.unshift(newComment);
    localStorage.setItem('comments', JSON.stringify(comments));
  }
  isModalOpen: boolean = false;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.editedTitle = this.postTitle;
    this.editedBody = this.postBody;
  }
  addNewComment(name: String, commentBody: String) {
    if (!name.trim() || !commentBody.trim()) {
      return;
    }
    console.log(name);
    const newComment = {
      name: name.trim(),
      body: commentBody.trim(),
      postId: this.comments.length + 1,
      id: Date.now(),
    };
    this.apiService.addNewComment(newComment).subscribe(
      (response) => {
        console.log('New user and post added successfully:', response);
        this.saveToLocalStorage(newComment);

        this.resolvedComments.push(newComment);
        console.log(this.comments, newComment);
        this.addCommentForm.reset();
      },
      (error) => {
        console.error('Error adding new user and post:', error);
      }
    );
  }

  ngOnInit(): void {
    const currentCommentUrl = window.location.href;
    const match = currentCommentUrl.match(/\d+$/);
    if (match) {
      this.parseNumber = parseInt(match[0], 10);
    }
    // this.comments$ = this.apiService.getAllComments(this.parseNumber);
    this.comments$ = this.apiService.getAllComments(this.parseNumber);
    this.comments$.subscribe(
      (comments) => {
        this.resolvedComments = comments;
      },
      (error) => {
        console.error('Error fetching comments:', error);
      }
    );

    this.apiService.getComments().subscribe((Comments) => {
      this.comments = Comments;
    });
    this.apiService.getBody().subscribe((bodyData) => {
      this.bodyData = bodyData;
    });
    this.route.params.subscribe((params) => {
      this.postId = params['postId'];
    });
    const currentUrl = window.location.href;
    const matches = currentUrl.match(/\d+$/);
    if (matches) {
      this.parseNumber = parseInt(matches[0], 10);
      this.postId = this.parseNumber;
      this.loadPostTitleAndBody();
    }
  }
  loadPostTitleAndBody(): void {
    this.http
      .get<Body>(
        `https://jsonplaceholder.typicode.com/posts/${this.parseNumber}`
      )
      .subscribe(
        (post) => {
          this.postTitle = post.title;
          this.postBody = post.body;
        },
        (error) => {
          console.error('Error loading post:', error);
        }
      );
  }
}

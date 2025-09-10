const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    test('Creating a new thread: POST request to /api/threads/{board}', function(done) {
      chai.request(server)
        .post('/api/threads/test')
        .send({
          text: 'Test thread',
          delete_password: 'password123'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          done();
        });
    });
    
    test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', function(done) {
      chai.request(server)
        .get('/api/threads/test')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isAtMost(res.body.length, 10);
          if(res.body.length > 0) {
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'bumped_on');
            assert.property(res.body[0], 'replies');
            assert.notProperty(res.body[0], 'delete_password');
            assert.notProperty(res.body[0], 'reported');
            assert.isArray(res.body[0].replies);
            assert.isAtMost(res.body[0].replies.length, 3);
          }
          done();
        });
    });
    
    test('Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', function(done) {
      chai.request(server)
        .post('/api/threads/test')
        .send({
          text: 'Thread to delete',
          delete_password: 'correct_password'
        })
        .end(function(err, res) {
          chai.request(server)
            .get('/api/threads/test')
            .end(function(err, res) {
              const threadId = res.body[0]._id;
              chai.request(server)
                .delete('/api/threads/test')
                .send({
                  thread_id: threadId,
                  delete_password: 'wrong_password'
                })
                .end(function(err, res) {
                  assert.equal(res.status, 200);
                  assert.equal(res.text, 'incorrect password');
                  done();
                });
            });
        });
    });
    
    test('Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', function(done) {
      chai.request(server)
        .post('/api/threads/test')
        .send({
          text: 'Thread to delete',
          delete_password: 'correct_password'
        })
        .end(function(err, res) {
          chai.request(server)
            .get('/api/threads/test')
            .end(function(err, res) {
              const threadId = res.body[0]._id;
              chai.request(server)
                .delete('/api/threads/test')
                .send({
                  thread_id: threadId,
                  delete_password: 'correct_password'
                })
                .end(function(err, res) {
                  assert.equal(res.status, 200);
                  assert.equal(res.text, 'success');
                  done();
                });
            });
        });
    });
    
    test('Reporting a thread: PUT request to /api/threads/{board}', function(done) {
      chai.request(server)
        .post('/api/threads/test')
        .send({
          text: 'Thread to report',
          delete_password: 'password123'
        })
        .end(function(err, res) {
          chai.request(server)
            .get('/api/threads/test')
            .end(function(err, res) {
              const threadId = res.body[0]._id;
              chai.request(server)
                .put('/api/threads/test')
                .send({
                  thread_id: threadId
                })
                .end(function(err, res) {
                  assert.equal(res.status, 200);
                  assert.equal(res.text, 'reported');
                  done();
                });
            });
        });
    });

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    test('Creating a new reply: POST request to /api/replies/{board}', function(done) {
      chai.request(server)
        .post('/api/threads/test')
        .send({
          text: 'Thread for reply test',
          delete_password: 'password123'
        })
        .end(function(err, res) {
          chai.request(server)
            .get('/api/threads/test')
            .end(function(err, res) {
              const threadId = res.body[0]._id;
              chai.request(server)
                .post('/api/replies/test')
                .send({
                  thread_id: threadId,
                  text: 'Test reply',
                  delete_password: 'replypass'
                })
                .end(function(err, res) {
                  assert.equal(res.status, 200);
                  done();
                });
            });
        });
    });
    
    test('Viewing a single thread with all replies: GET request to /api/replies/{board}', function(done) {
      chai.request(server)
        .post('/api/threads/test')
        .send({
          text: 'Thread for full view test',
          delete_password: 'password123'
        })
        .end(function(err, res) {
          chai.request(server)
            .get('/api/threads/test')
            .end(function(err, res) {
              const threadId = res.body[0]._id;
              chai.request(server)
                .get('/api/replies/test')
                .query({ thread_id: threadId })
                .end(function(err, res) {
                  assert.equal(res.status, 200);
                  assert.property(res.body, '_id');
                  assert.property(res.body, 'text');
                  assert.property(res.body, 'created_on');
                  assert.property(res.body, 'bumped_on');
                  assert.property(res.body, 'replies');
                  assert.notProperty(res.body, 'delete_password');
                  assert.notProperty(res.body, 'reported');
                  assert.isArray(res.body.replies);
                  done();
                });
            });
        });
    });
    
    test('Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password', function(done) {
      chai.request(server)
        .post('/api/threads/test')
        .send({
          text: 'Thread for reply delete test',
          delete_password: 'password123'
        })
        .end(function(err, res) {
          chai.request(server)
            .get('/api/threads/test')
            .end(function(err, res) {
              const threadId = res.body[0]._id;
              chai.request(server)
                .post('/api/replies/test')
                .send({
                  thread_id: threadId,
                  text: 'Reply to delete',
                  delete_password: 'correct_reply_pass'
                })
                .end(function(err, res) {
                  chai.request(server)
                    .get('/api/replies/test')
                    .query({ thread_id: threadId })
                    .end(function(err, res) {
                      const replyId = res.body.replies[0]._id;
                      chai.request(server)
                        .delete('/api/replies/test')
                        .send({
                          thread_id: threadId,
                          reply_id: replyId,
                          delete_password: 'wrong_password'
                        })
                        .end(function(err, res) {
                          assert.equal(res.status, 200);
                          assert.equal(res.text, 'incorrect password');
                          done();
                        });
                    });
                });
            });
        });
    });
    
    test('Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password', function(done) {
      chai.request(server)
        .post('/api/threads/test')
        .send({
          text: 'Thread for reply delete test',
          delete_password: 'password123'
        })
        .end(function(err, res) {
          chai.request(server)
            .get('/api/threads/test')
            .end(function(err, res) {
              const threadId = res.body[0]._id;
              chai.request(server)
                .post('/api/replies/test')
                .send({
                  thread_id: threadId,
                  text: 'Reply to delete',
                  delete_password: 'correct_reply_pass'
                })
                .end(function(err, res) {
                  chai.request(server)
                    .get('/api/replies/test')
                    .query({ thread_id: threadId })
                    .end(function(err, res) {
                      const replyId = res.body.replies[0]._id;
                      chai.request(server)
                        .delete('/api/replies/test')
                        .send({
                          thread_id: threadId,
                          reply_id: replyId,
                          delete_password: 'correct_reply_pass'
                        })
                        .end(function(err, res) {
                          assert.equal(res.status, 200);
                          assert.equal(res.text, 'success');
                          done();
                        });
                    });
                });
            });
        });
    });
    
    test('Reporting a reply: PUT request to /api/replies/{board}', function(done) {
      chai.request(server)
        .post('/api/threads/test')
        .send({
          text: 'Thread for reply report test',
          delete_password: 'password123'
        })
        .end(function(err, res) {
          chai.request(server)
            .get('/api/threads/test')
            .end(function(err, res) {
              const threadId = res.body[0]._id;
              chai.request(server)
                .post('/api/replies/test')
                .send({
                  thread_id: threadId,
                  text: 'Reply to report',
                  delete_password: 'replypass'
                })
                .end(function(err, res) {
                  chai.request(server)
                    .get('/api/replies/test')
                    .query({ thread_id: threadId })
                    .end(function(err, res) {
                      const replyId = res.body.replies[0]._id;
                      chai.request(server)
                        .put('/api/replies/test')
                        .send({
                          thread_id: threadId,
                          reply_id: replyId
                        })
                        .end(function(err, res) {
                          assert.equal(res.status, 200);
                          assert.equal(res.text, 'reported');
                          done();
                        });
                    });
                });
            });
        });
    });

  });

});
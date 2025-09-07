'use strict';

const Thread = require('../models/Thread');

module.exports = function (app) {
  
  // THREADS
  app.route('/api/threads/:board')
    // Crear thread
    .post(async (req, res) => {
      try {
        const board = req.params.board;
        const { text, delete_password } = req.body;

        const newThread = new Thread({
          board,
          text,
          delete_password,
          created_on: new Date(),
          bumped_on: new Date()
        });

        await newThread.save();
        return res.redirect('/b/' + board + '/');
      } catch (err) {
        console.error(err);
        res.status(500).send('error');
      }
    })

    // Listar threads (máx 10, máx 3 replies, ocultar reported y delete_password)
    .get(async (req, res) => {
      try {
        const board = req.params.board;

        const threads = await Thread.find({ board })
          .sort({ bumped_on: -1 })
          .limit(10)
          .lean();

        const sanitized = threads.map(t => {
          return {
            _id: t._id,
            text: t.text,
            created_on: t.created_on,
            bumped_on: t.bumped_on,
            replies: (t.replies || [])
              .sort((a, b) => b.created_on - a.created_on)
              .slice(0, 3)
              .map(r => ({
                _id: r._id,
                text: r.text,
                created_on: r.created_on
              }))
          };
        });

        res.json(sanitized);
      } catch (err) {
        console.error(err);
        res.status(500).send('error');
      }
    })

    // Borrar thread
    .delete(async (req, res) => {
      try {
        const { thread_id, delete_password } = req.body;
        const deleted = await Thread.findOneAndDelete({
          _id: thread_id,
          delete_password
        });
        if (deleted) {
          return res.send('success');
        } else {
          return res.send('incorrect password');
        }
      } catch (err) {
        console.error(err);
        res.status(500).send('error');
      }
    })

    // Reportar thread
    .put(async (req, res) => {
      try {
        const { thread_id } = req.body;
        const thread = await Thread.findById(thread_id);
        if (!thread) return res.status(404).send('not found');
        thread.reported = true;
        await thread.save();
        res.send('reported');
      } catch (err) {
        console.error(err);
        res.status(500).send('error');
      }
    });

  // REPLIES
  app.route('/api/replies/:board')
    // Crear reply
    .post(async (req, res) => {
      try {
        const board = req.params.board;
        const { thread_id, text, delete_password } = req.body;

        const thread = await Thread.findById(thread_id);
        if (!thread) return res.status(404).send('not found');

        thread.replies.push({
          text,
          delete_password,
          created_on: new Date()
        });
        thread.bumped_on = new Date();
        await thread.save();

        return res.redirect('/b/' + board + '/' + thread_id);
      } catch (err) {
        console.error(err);
        res.status(500).send('error');
      }
    })

    // Obtener thread completo con replies
    .get(async (req, res) => {
      try {
        const { thread_id } = req.query;
        const thread = await Thread.findById(thread_id).lean();
        if (!thread) return res.status(404).send('not found');

        const sanitized = {
          _id: thread._id,
          text: thread.text,
          created_on: thread.created_on,
          bumped_on: thread.bumped_on,
          replies: (thread.replies || []).map(r => ({
            _id: r._id,
            text: r.text,
            created_on: r.created_on
          }))
        };

        res.json(sanitized);
      } catch (err) {
        console.error(err);
        res.status(500).send('error');
      }
    })

    // Borrar reply (cambiar a "[deleted]")
    .delete(async (req, res) => {
      try {
        const { thread_id, reply_id, delete_password } = req.body;
        const thread = await Thread.findById(thread_id);
        if (!thread) return res.status(404).send('not found');

        const reply = thread.replies.id(reply_id);
        if (!reply) return res.status(404).send('not found');

        if (reply.delete_password !== delete_password) {
          return res.send('incorrect password');
        }

        reply.text = '[deleted]';
        await thread.save();
        res.send('success');
      } catch (err) {
        console.error(err);
        res.status(500).send('error');
      }
    })

    // Reportar reply
    .put(async (req, res) => {
      try {
        const { thread_id, reply_id } = req.body;
        const thread = await Thread.findById(thread_id);
        if (!thread) return res.status(404).send('not found');

        const reply = thread.replies.id(reply_id);
        if (!reply) return res.status(404).send('not found');

        reply.reported = true;
        await thread.save();
        res.send('reported');
      } catch (err) {
        console.error(err);
        res.status(500).send('error');
      }
    });
};

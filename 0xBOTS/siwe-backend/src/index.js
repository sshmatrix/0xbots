import cors from 'cors';
import express from 'express';
import Session from 'express-session';
import { generateNonce, SiweMessage } from 'siwe';
import { exec } from 'child_process';

import https from 'https';
import fs from 'fs';


const options = {
	key: fs.readFileSync('/root/.ssl/work_inpl_one.key'),
	cert: fs.readFileSync('/root/.ssl/work_inpl_one.crt')
};

const app = express();
app.use(express.json());

const PORT = 3001;

app.use(cors({
	origin: [
						'https://work.inpl.one',
						'https://0xbots.eth.limo',
						'https://0xbots.eth.link'
					],
	credentials: true,
}));

console.log("Hello World!");
app.get('/state', async function (req, res) {
	res.end('NodeJS is running on port ' + PORT + '\n');
});

const oneDay = 1000 * 60 * 60 * 24;
app.use(Session({
	name: 'siwe-quickstart',
	secret: "siwe-quickstart-alpha",
	resave: true,
	saveUninitialized: true,
	cookie: { secure: true, sameSite: 'none', maxAge: oneDay }
}));

app.get('/nunce', async function (req, res) {
	req.session.nonce = generateNonce();
	res.setHeader('Content-Type', 'text/plain');
	console.log(req.session);
	res.status(200).send(req.session.nonce);
});

app.get('/nonce', async function (req, res) {
	var obj = JSON.parse(fs.readFileSync('/var/www/html/.well-known/jobRequest.json', 'utf8'));
	res.setHeader('Content-Type', 'text/plain');
	req.session.nonce = obj.str;
	res.status(200).send(req.session.nonce);
});

app.post('/verify', async function (req, res) {
	try {
		if (!req.body.message) {
			res.status(422).json({ message: 'Expected prepareMessage object as body.' });
			return;
		}

		let message = new SiweMessage(req.body.message);
		const fields = await message.validate(req.body.signature);
		console.log(req.session);
		if (fields.nonce !== req.session.nonce) {
			res.status(422).json({
				message: 'Invalid nonce.',
			});
			return;
		}
		req.session.siwe = fields;
		req.session.cookie.expires = new Date(fields.expirationTime);
		var obj = JSON.parse(fs.readFileSync('/var/www/html/.well-known/jobRequest.json', 'utf8'));
		exec('docker run python:alpine python -c "' + obj.script + '"', (err, stdout, stderr) => {
  		if (err) {
				req.session.save(() => res.status(200).send('❌❌❌: ' + `${stderr}` + ' NGMI 💀💀💀'));
  		} else {
				req.session.save(() => res.status(200).send('✅✅✅: ' + `${stdout}` + ' WAGMI 🔥🔥🔥 Send LN-BTC to sshmatrix@0xbots.eth.limo ⚡⚡⚡'));
			}
		});

	} catch (e) {
		req.session.siwe = null;
		req.session.nonce = null;
		console.error(e);
		switch (e) {
			case ErrorTypes.EXPIRED_MESSAGE: {
				req.session.save(() => res.status(440).json({ message: e.message }));
				break;
			}
			case ErrorTypes.INVALID_SIGNATURE: {
				req.session.save(() => res.status(422).json({ message: e.message }));
				break;
			}
			default: {
				req.session.save(() => res.status(500).json({ message: e.message }));
				break;
			}
		}
	}
});

app.get('/personal_information', function (req, res) {
	if (!req.session.siwe) {
		res.status(401).json({ message: 'Please Sign-in first' });
		return;
	}

	res.setHeader('Content-Type', 'text/plain');
	res.send(`You are authenticated and your address is: ${req.session.siwe.address}`);
});

app.post('/write', function (req, res) {
	let randomIndex = generateNonce();
	let command = req.body.message;
	console.log(command);
	const jsonData = {
	  "script": command,
	  "args": "0",
	  "str": randomIndex,
	  "uri": "https://work.inpl.one:3001",
	  "flag": "0"
	};
	const content = jsonData;
	fs.writeFile('/var/www/html/.well-known/jobRequest.json', JSON.stringify(content, null, 4), err => {
  	if (err) {
    	console.error(err)
    	return
  	}
	});
	console.log('✓ wrote a job successfully with nonce ' + randomIndex);
	res.send(randomIndex);
});

console.log("Sign-in with Ethereum server is listening on port " + PORT);


https.createServer(options,app).listen(PORT);

import cors from 'cors';
import express from 'express';
import Session from 'express-session';
import { generateNonce, SiweMessage } from 'siwe';


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

app.get('/nonce', async function (req, res) {
	req.session.nonce = generateNonce();
	res.setHeader('Content-Type', 'text/plain');
	console.log(req.session);
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
		req.session.save(() => res.status(200).end());

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
console.log("Sign-in with Ethereum server is listening on port " + PORT);


https.createServer(options,app).listen(PORT);

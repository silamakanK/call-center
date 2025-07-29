const { User } = require('../models/user');

module.exports = {
  async createNewUser(req, res) {
    const { fullname, username, password } = req.body;

     const missingFields = []
    
    if (fullname === undefined) missingFields.push('fullname')
    if (username === undefined) missingFields.push('username')
    if (password === undefined) missingFields.push('password')

    if (missingFields.length > 0) {
        return res.status(400).json({ 
            message: `Missing required fields: ${missingFields.join(', ')}` 
        })
    }

    // Vérifier si les champs sont vides
    if ( !first_name || !last_name || !username || !password ) {
        return res.status(422).json({message: 'All fields are required'})
    }

    const existingUser = await User.findOne({ where: { username } })
    if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' })
    }

    const hashedPwd = await bcrypt.hash(password, 10)

    const userObject = { 
        fullname, 
        username, 
        "password": hashedPwd,
    }

    try {
        const user = await User.create(userObject)

        // if (user) {
        //     const activationToken = jwt.sign(
        //         { userId: user.id, email: username },
        //         process.env.ACCESS_TOKEN_SECRET,
        //         { expiresIn: '24h' }
        //     )

        //     // await sendConfirmationEmail(first_name, username)

        //     // await sendActivationEmail(first_name, username, activationToken)

        //     res.status(201).json({ 
        //         message: `New user ${username} created. Please check your email to activate your account.` 
        //     })
        // }
    } catch (error) {
        console.error('Error creating user:', error)
        res.status(500).json({ message: 'Error creating user' })
    }

    // try {
    //   const existing = await User.findOne({ where: { username } });
    //   if (existing) return res.status(409).json({ message: 'Utilisateur déjà existant' });

    //   const user = await User.create({ username, password }); // 💡 Ajoute hash si besoin
    //   return res.status(201).json(user);
    // } catch (err) {
    //   return res.status(500).json({ message: 'Erreur serveur', error: err.message });
    // }
  },

  async loginUser(req, res) {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ where: { username } });
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Identifiants invalides' });
      }
      return res.status(200).json({ message: 'Connexion réussie', user });
    } catch (err) {
      return res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
  }
};

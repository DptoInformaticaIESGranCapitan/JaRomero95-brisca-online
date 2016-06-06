<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @ORM\Entity
 * @UniqueEntity(fields="email", message="Ya existe una cuenta con ese email")
 * @UniqueEntity(fields="nick", message="Ya existe una cuenta con ese nombre de usuario")
 */
class User implements UserInterface, \Serializable
{
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="email", type="string", length=255, unique=true)
     * @Assert\NotBlank(message = "Debe rellenar este campo")
     */
    private $email;

    /**
     * @var UploadedFile
     * @Assert\Image(
     *     maxSize = "500k",
     *     maxSizeMessage = "El tamaño máximo de archivo es de 500 Kb"
     * )
     */
    protected $img;

    /**
     * @var string
     * @ORM\Column(type="string", nullable=true)
     */
    protected $imgPath;

    /**
     * @return string
     */
    public function getImgPath()
    {
        return $this->imgPath;
    }

    /**
     * @param string $imgPath
     */
    public function setImgPath($imgPath)
    {
        $this->imgPath = $imgPath;
    }

    /**
     * @return mixed
     */
    public function getImg()
    {
        return $this->img;
    }

    /**
     * @param mixed $img
     */
    public function setImg(UploadedFile $img)
    {
        $this->img = $img;
    }

    public function uploadImg($rootPath){
        if (null === $this->img) {
            return;
        }
        $nameImg = $this->nick . '-image';
        $this->img->move($rootPath, $nameImg);
        $this->setImgPath($nameImg);
    }

    protected function getUploadRootDir()
    {
        // the absolute directory path where uploaded
        // documents should be saved
        return __DIR__.'/../../../../web/'.$this->getUploadDir();
    }

    protected function getUploadDir()
    {
        // get rid of the __DIR__ so it doesn't screw up
        // when displaying uploaded doc/image in the view.
        return 'uploads/images';
    }

    /**
     * @var string
     *
     * @ORM\Column(name="nick", type="string", length=15, unique=true)
     * @Assert\NotBlank
     * @Assert\Regex(
     *     pattern="/^\w+$/",
     *     htmlPattern = false,
     *     message="El nombre de usuario solo puede contener letras, números y guiones bajos"
     * )
     * @Assert\Length(
     *     min=3,
     *     max=8,
     *     minMessage="El nombre de usuario debe contener al menos 3 caracteres",
     *     maxMessage="El nombre de usuario debe contener como máximo 8 caracteres"
     * )
     */
    private $nick;

    /**
     * @return string
     */
    public function getNick()
    {
        return $this->nick;
    }

    /**
     * @param string $nick
     */
    public function setNick($nick)
    {
        $this->nick = $nick;
    }

    /**
     * @var string
     *
     * @ORM\Column(name="password", type="string", length=255)
     */
    private $password;

    /**
     * @Assert\Length(max=4096)
     * @Assert\Regex(
     *     pattern="/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/",
     *     message="La contraseña debe tener al menos una mayúscula, una minúscula y un número"
     * )
     * @Assert\Length(
     *     min=6,
     *     max=20,
     *     minMessage="La contraseña debe contener al menos 6 caracteres",
     *     maxMessage="La contraseña debe contener como máximo 20 caracteres"
     * )
     */
    private $plainPassword;


    /**
     * Get id
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set email
     *
     * @param string $email
     *
     * @return User
     */
    public function setEmail($email)
    {
        $this->email = $email;

        return $this;
    }

    /**
     * Get email
     *
     * @return string
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * Set password
     *
     * @param string $password
     *
     * @return User
     */
    public function setPassword($password)
    {
        $this->password = $password;

        return $this;
    }



    /**
     * Get password
     *
     * @return string
     */
    public function getPassword()
    {
        return $this->password;
    }

    public function getPlainPassword()
    {
        return $this->plainPassword;
    }

    public function setPlainPassword($password)
    {
        $this->plainPassword = $password;
    }

    /**
     * Returns the roles granted to the user.
     *
     * <code>
     * public function getRoles()
     * {
     *     return array('ROLE_USER');
     * }
     * </code>
     *
     * Alternatively, the roles might be stored on a ``roles`` property,
     * and populated in any number of different ways when the user object
     * is created.
     *
     * @return (Role|string)[] The user roles
     */
    public function getRoles()
    {
        return array('ROLE_USER');
    }

    /**
     * Returns the salt that was originally used to encode the password.
     *
     * This can return null if the password was not encoded using a salt.
     *
     * @return string|null The salt
     */
    public function getSalt()
    {
        return null;
    }

    /**
     * Returns the username used to authenticate the user.
     *
     * @return string The username
     */
    public function getUsername()
    {
        return $this->email;
    }

    /**
     * Removes sensitive data from the user.
     *
     * This is important if, at any given point, sensitive information like
     * the plain-text password is stored on this object.
     */
    public function eraseCredentials()
    {
    }

    /** @see \Serializable::serialize() */
    public function serialize()
    {
        return serialize(array(
            $this->id,
            $this->nick,
            $this->email,
            $this->imgPath,
            $this->password,
            $this->plainPassword,
        ));
    }

    /** @see \Serializable::unserialize() */
    public function unserialize($serialized)
    {
        list (
            $this->id,
            $this->nick,
            $this->email,
            $this->imgPath,
            $this->password,
            $this->plainPassword
            ) = unserialize($serialized);
    }
}


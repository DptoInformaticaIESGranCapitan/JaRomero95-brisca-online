<?php
namespace AppBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\FixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use AppBundle\Entity\User;

class LoadUserData implements FixtureInterface, ContainerAwareInterface
{

    /**
     * @var ContainerInterface
     */
    private $container;

    public function load(ObjectManager $manager)
    {
        $users = array(
            array('email'=>'em1@mail.com', 'plainPassword'=>'1111', 'nick'=>'user1'),
            array('email'=>'em2@mail.com', 'plainPassword'=>'1111', 'nick'=>'user2'),
            array('email'=>'em3@mail.com', 'plainPassword'=>'1111', 'nick'=>'user3'),
            array('email'=>'em4@mail.com', 'plainPassword'=>'1111', 'nick'=>'user4'),
            array('email'=>'em5@mail.com', 'plainPassword'=>'1111', 'nick'=>'user5')
        );

        foreach($users as $user){
            $entity = new User();
            $encoder = $this->container->get('security.password_encoder');
            $password = $encoder->encodePassword($entity, $user['plainPassword']);
            $entity->setPassword($password);
            $entity->setEmail($user['email']);
            $entity->setNick($user['nick']);

            if(!$entity->getImgPath()){
                $entity->setImgPath('noUserImg.png');
            }

            $manager->persist($entity);
            $manager->flush();
        }
    }

    /**
     * Sets the container.
     *
     * @param ContainerInterface|null $container A ContainerInterface instance or null
     */
    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }
}
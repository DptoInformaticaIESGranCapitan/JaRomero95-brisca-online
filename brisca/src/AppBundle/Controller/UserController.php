<?php
namespace AppBundle\Controller;

use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use AppBundle\Form\UserType;
use AppBundle\Form\PasswordUserType;
use AppBundle\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

class UserController extends Controller
{
    /**
     * @Route("/registro", name="register")
     */
    public function registerAction(Request $request)
    {
        // denegar acceso al registro a usuarios logueados
        $user = $this->getUser();
        if($user){
            return $this->redirectToRoute('homepage');
        }


        // 1) build the form
        $user = new User();
        $form = $this->createForm(UserType::class, $user);

        // 2) handle the submit (will only happen on POST)
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            if($user->getPlainPassword()){
                // 3) Encode the password (you could also do this via Doctrine listener)
                $password = $this->get('security.password_encoder')
                    ->encodePassword($user, $user->getPlainPassword());
                $user->setPassword($password);

                // 4) save the User!
                $em = $this->getDoctrine()->getManager();

                $rootDir = $this->container->getParameter('kernel.root_dir').'/../web/uploads/images';
                $user->uploadImg($rootDir);

                if(!$user->getImgPath()){
                    $user->setImgPath('noUserImg.png' . rand(1, 12));
                }

                $em->persist($user);
                $em->flush();

                $this->addFlash('register', '¡Te has registrado con éxito!');

            return $this->redirectToRoute('homepage');
            }
        }

        return $this->render('user/registro.html.twig',
            array(
                'form' => $form->createView()
            )
        );
    }

    /**
     * @Route("/perfil", name="perfil")
     */
    public function perfilAction(Request $request)
    {
        // 1) build the form
        $user = $this->getUser();
        $form = $this->createForm(UserType::class, $user);

        // 2) handle the submit (will only happen on POST)
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {

            if (null != $user->getPlainPassword()) {
                $password = $this->get('security.password_encoder')
                    ->encodePassword($user, $user->getPlainPassword());
                $user->setPassword($password);
            }

            $rootDir = $this->container->getParameter('kernel.root_dir').'/../web/uploads/images';
            $user->uploadImg($rootDir);

            if(!$user->getImgPath()){
                $user->setImgPath('noUserImg.png' . rand(1, 12));
            }

            $em = $this->getDoctrine()->getManager();
//            $user->uploadImg();

            $em->persist($user);
            $em->flush();

            $this->addFlash('save', 'Tus cambios se han guardado');
        }


        return $this->render('user/perfil.html.twig',
            array(
                'form' => $form->createView()
            )
        );
    }

}
<?php
namespace WreckThemBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class UserType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('email', EmailType::class)
            ->add('nick')
            ->add(
                'img',
                FileType::class,
                array('required' => false)
            )
            ->add('plainPassword', RepeatedType::class, array(
                    'type' => PasswordType::class,
                    'invalid_message' => 'Las contraseñas deben coincidir',
                    'first_options'  => array('label' => 'Contraseña'),
                    'second_options' => array('label' => 'Repite la contraseña'),
                )
            );
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'WreckThemBundle\Entity\User',
        ));
    }

    /**
     * Sets the default options for this type.
     *
     * @param OptionsResolverInterface $resolver The resolver for the options.
     *
     * @deprecated since version 2.7, to be renamed in 3.0.
     *             Use the method configureOptions instead. This method will be
     *             added to the FormTypeInterface with Symfony 3.0.
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        // TODO: Implement setDefaultOptions() method.
    }

    /**
     * Returns the name of this type.
     *
     * @return string The name of this type
     *
     * @deprecated Deprecated since Symfony 2.8, to be removed in Symfony 3.0.
     *             Use the fully-qualified class name of the type instead.
     */
    public function getName()
    {
        // TODO: Implement getName() method.
    }
}